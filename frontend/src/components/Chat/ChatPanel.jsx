import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, Send, ArrowLeft, Loader, Plus, X } from 'lucide-react';
import chatApi from '../../api/chatApi';
import './ChatPanel.css';

const LIST_POLL_INTERVAL   = 15_000;
const THREAD_POLL_INTERVAL = 4_000;

const initials = (name) => {
  if (!name) return '?';
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
};

const timeShort = (d) => {
  if (!d) return '';
  const date = new Date(d);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  return sameDay
    ? date.toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString('en-LK', { month: 'short', day: 'numeric' });
};

const normConversation = (c) => ({
  conversationId: c.conversationId ?? c.ConversationId,
  customerId:     c.customerId     ?? c.CustomerId,
  providerId:     c.providerId     ?? c.ProviderId,
  otherPartyName: c.otherPartyName ?? c.OtherPartyName ?? 'Unknown',
  lastMessage:    c.lastMessage    ?? c.LastMessage    ?? '',
  lastMessageAt:  c.lastMessageAt  ?? c.LastMessageAt,
  unreadCount:    c.unreadCount    ?? c.UnreadCount     ?? 0,
  createdAt:      c.createdAt      ?? c.CreatedAt,
});

const normMessage = (m) => ({
  messageId:      m.messageId      ?? m.MessageId,
  conversationId: m.conversationId ?? m.ConversationId,
  senderRole:     m.senderRole     ?? m.SenderRole,
  body:           m.body           ?? m.Body,
  isRead:         m.isRead         ?? m.IsRead,
  createdAt:      m.createdAt      ?? m.CreatedAt,
});

/**
 * Shared customer <-> provider chat UI.
 * viewerRole: 'customer' | 'provider' — determines which side of each message is "mine".
 * otherPartyLabel: label used in empty-state copy, e.g. "provider" / "customer".
 * fetchContacts: optional async () => [{ id, name, subtitle }] — when given, shows a
 *   "+" picker so the viewer can start a brand new conversation (customer -> provider only).
 * contactIdKey: request body key sent to /chat/conversations/start, e.g. "providerId".
 */
const ChatPanel = ({ viewerRole, otherPartyLabel, fetchContacts, contactIdKey }) => {
  const location = useLocation();

  const [conversations, setConversations] = useState([]);
  const [listLoading,   setListLoading]    = useState(true);
  const [active,        setActive]         = useState(null); // normalized conversation
  const [messages,      setMessages]       = useState([]);
  const [threadLoading, setThreadLoading]  = useState(false);
  const [draft,         setDraft]          = useState('');
  const [sending,       setSending]        = useState(false);
  const [mobileShowThread, setMobileShowThread] = useState(false);

  const [pickerOpen,      setPickerOpen]      = useState(false);
  const [contacts,        setContacts]        = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactSearch,   setContactSearch]   = useState('');

  const bottomRef  = useRef(null);
  const startedRef = useRef(false);

  // ── Load conversation list ──────────────────────────────────────────
  const loadConversations = useCallback(async (opts = {}) => {
    if (!opts.silent) setListLoading(true);
    try {
      const res = await chatApi.getConversations();
      const list = (res?.data?.data ?? []).map(normConversation);
      setConversations(list);
      return list;
    } catch {
      return [];
    } finally {
      if (!opts.silent) setListLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
    const timer = setInterval(() => loadConversations({ silent: true }), LIST_POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [loadConversations]);

  // ── Deep-link: navigated here with { startWith: { providerId | customerId, name } } ──
  useEffect(() => {
    const startWith = location.state?.startWith;
    if (!startWith || startedRef.current) return;
    startedRef.current = true;

    (async () => {
      try {
        const payload = viewerRole === 'customer'
          ? { providerId: startWith.providerId }
          : { customerId: startWith.customerId };
        const res = await chatApi.startConversation(payload);
        const conversationId = res?.data?.conversationId;
        if (!conversationId) return;

        const list = await loadConversations();
        const found = list.find(c => c.conversationId === conversationId);
        openConversation(found ?? {
          conversationId,
          customerId: viewerRole === 'customer' ? undefined : startWith.customerId,
          providerId: viewerRole === 'customer' ? startWith.providerId : undefined,
          otherPartyName: startWith.name ?? 'Chat',
          lastMessage: '', lastMessageAt: null, unreadCount: 0, createdAt: null,
        });
      } catch {
        /* ignore — user can still pick a conversation manually */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // ── Thread loading + polling ────────────────────────────────────────
  const loadMessages = useCallback(async (conversationId, opts = {}) => {
    if (!opts.silent) setThreadLoading(true);
    try {
      const res = await chatApi.getMessages(conversationId);
      setMessages((res?.data?.data ?? []).map(normMessage));
    } catch {
      /* keep previous messages on transient error */
    } finally {
      if (!opts.silent) setThreadLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    loadMessages(active.conversationId);
    const timer = setInterval(() => loadMessages(active.conversationId, { silent: true }), THREAD_POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [active?.conversationId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openConversation = (conv) => {
    setActive(conv);
    setMobileShowThread(true);
    setConversations(prev => prev.map(c =>
      c.conversationId === conv.conversationId ? { ...c, unreadCount: 0 } : c
    ));
  };

  const openPicker = async () => {
    setPickerOpen(true);
    setContactSearch('');
    setContactsLoading(true);
    try {
      const list = await fetchContacts();
      setContacts(Array.isArray(list) ? list : []);
    } catch {
      setContacts([]);
    } finally {
      setContactsLoading(false);
    }
  };

  const startWithContact = async (contact) => {
    try {
      const res = await chatApi.startConversation({ [contactIdKey]: contact.id });
      const conversationId = res?.data?.conversationId;
      setPickerOpen(false);
      if (!conversationId) return;

      const list = await loadConversations();
      const found = list.find(c => c.conversationId === conversationId);
      openConversation(found ?? {
        conversationId,
        otherPartyName: contact.name,
        lastMessage: '', lastMessageAt: null, unreadCount: 0, createdAt: null,
      });
    } catch {
      /* ignore — picker stays closed, user can retry from the list */
    }
  };

  const filteredContacts = contacts.filter(c =>
    !contactSearch.trim() || c.name.toLowerCase().includes(contactSearch.trim().toLowerCase())
  );

  const handleSend = async (e) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body || !active || sending) return;

    setSending(true);
    setDraft('');
    try {
      const res = await chatApi.sendMessage(active.conversationId, body);
      const sent = normMessage(res?.data?.data ?? {});
      setMessages(prev => [...prev, sent]);
      setConversations(prev => {
        const next = prev.map(c =>
          c.conversationId === active.conversationId
            ? { ...c, lastMessage: body, lastMessageAt: sent.createdAt || new Date().toISOString() }
            : c
        );
        return next.sort((a, b) =>
          new Date(b.lastMessageAt ?? b.createdAt) - new Date(a.lastMessageAt ?? a.createdAt)
        );
      });
    } catch {
      setDraft(body); // restore on failure
    } finally {
      setSending(false);
    }
  };

  const totalUnread = conversations.reduce((s, c) => s + (c.unreadCount || 0), 0);

  return (
    <div className="cht-page">
      <div className="cht-shell">

        {/* ── Conversation list ── */}
        <div className={`cht-list-pane${mobileShowThread ? ' cht-hide-mobile' : ''}`}>
          <div className="cht-list-header">
            <h2><MessageCircle size={18} /> Messages</h2>
            <div className="cht-header-actions">
              {totalUnread > 0 && <span className="cht-total-badge">{totalUnread}</span>}
              {fetchContacts && (
                <button className="cht-new-btn" onClick={openPicker} title={`Message a ${otherPartyLabel}`}>
                  <Plus size={16} />
                </button>
              )}
            </div>
          </div>

          {listLoading ? (
            <div className="cht-state"><Loader size={24} className="cht-spin" /><p>Loading…</p></div>
          ) : conversations.length === 0 ? (
            <div className="cht-state">
              <MessageCircle size={36} strokeWidth={1.2} />
              <p>No conversations yet</p>
              <span>Messages with {otherPartyLabel}s will show up here</span>
              {fetchContacts && (
                <button className="cht-empty-cta" onClick={openPicker}>
                  <Plus size={14} /> Message a {otherPartyLabel}
                </button>
              )}
            </div>
          ) : (
            <div className="cht-list">
              {conversations.map((c) => (
                <button
                  key={c.conversationId}
                  className={`cht-list-item${active?.conversationId === c.conversationId ? ' cht-list-item-active' : ''}`}
                  onClick={() => openConversation(c)}
                >
                  <div className="cht-avatar">{initials(c.otherPartyName)}</div>
                  <div className="cht-list-item-body">
                    <div className="cht-list-item-top">
                      <span className="cht-list-item-name">{c.otherPartyName}</span>
                      <span className="cht-list-item-time">{timeShort(c.lastMessageAt ?? c.createdAt)}</span>
                    </div>
                    <div className="cht-list-item-bottom">
                      <span className="cht-list-item-preview">{c.lastMessage || 'Say hello 👋'}</span>
                      {c.unreadCount > 0 && <span className="cht-unread-dot">{c.unreadCount}</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Thread ── */}
        <div className={`cht-thread-pane${!mobileShowThread ? ' cht-hide-mobile' : ''}`}>
          {!active ? (
            <div className="cht-state cht-thread-empty">
              <MessageCircle size={48} strokeWidth={1} />
              <p>Select a conversation to start chatting</p>
            </div>
          ) : (
            <>
              <div className="cht-thread-header">
                <button className="cht-back-btn" onClick={() => setMobileShowThread(false)}>
                  <ArrowLeft size={18} />
                </button>
                <div className="cht-avatar">{initials(active.otherPartyName)}</div>
                <span className="cht-thread-name">{active.otherPartyName}</span>
              </div>

              <div className="cht-messages">
                {threadLoading ? (
                  <div className="cht-state"><Loader size={22} className="cht-spin" /></div>
                ) : messages.length === 0 ? (
                  <div className="cht-state">
                    <p>No messages yet — say hello 👋</p>
                  </div>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.messageId}
                      className={`cht-bubble-row${m.senderRole === viewerRole ? ' cht-bubble-mine' : ''}`}
                    >
                      <div className="cht-bubble">
                        <p>{m.body}</p>
                        <span className="cht-bubble-time">{timeShort(m.createdAt)}</span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              <form className="cht-composer" onSubmit={handleSend}>
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message…"
                  maxLength={2000}
                  disabled={sending}
                />
                <button type="submit" disabled={!draft.trim() || sending} aria-label="Send">
                  <Send size={18} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* ── New chat picker ── */}
      {pickerOpen && (
        <div className="cht-picker-overlay" onClick={() => setPickerOpen(false)}>
          <div className="cht-picker" onClick={(e) => e.stopPropagation()}>
            <div className="cht-picker-header">
              <h3>Message a {otherPartyLabel}</h3>
              <button onClick={() => setPickerOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <input
              type="text"
              className="cht-picker-search"
              placeholder={`Search ${otherPartyLabel}s…`}
              value={contactSearch}
              onChange={(e) => setContactSearch(e.target.value)}
              autoFocus
            />
            <div className="cht-picker-list">
              {contactsLoading ? (
                <div className="cht-state"><Loader size={20} className="cht-spin" /></div>
              ) : filteredContacts.length === 0 ? (
                <div className="cht-state"><p>No {otherPartyLabel}s found</p></div>
              ) : (
                filteredContacts.map((c) => (
                  <button key={c.id} className="cht-picker-item" onClick={() => startWithContact(c)}>
                    <div className="cht-avatar">{initials(c.name)}</div>
                    <div className="cht-picker-item-text">
                      <div className="cht-picker-item-name">{c.name}</div>
                      {c.subtitle && <div className="cht-picker-item-sub">{c.subtitle}</div>}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPanel;
