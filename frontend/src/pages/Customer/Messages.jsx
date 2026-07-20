import CustomerNavbar from '../../components/CustomerNavbar/CustomerNavbar';
import ChatPanel from '../../components/Chat/ChatPanel';
import api from '../../utils/api';

const fetchProviderContacts = async () => {
  const res = await api.get('/providers/with-services');
  const list = res?.data?.data ?? [];
  return list.map((p) => ({
    id: p.providerId ?? p.ProviderId,
    name: p.businessName ?? p.BusinessName ?? 'Provider',
    subtitle: p.businessAddress ?? p.BusinessAddress ?? '',
  }));
};

const Messages = () => (
  <>
    <CustomerNavbar />
    <ChatPanel
      viewerRole="customer"
      otherPartyLabel="provider"
      fetchContacts={fetchProviderContacts}
      contactIdKey="providerId"
    />
  </>
);

export default Messages;
