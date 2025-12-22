import { createContext, useState, useContext } from 'react';

const BookingContext = createContext(null);

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [currentBooking, setCurrentBooking] = useState(null);
  const [bookings, setBookings] = useState([]);

  const createBooking = (bookingData) => {
    const newBooking = {
      id: Date.now().toString(),
      ...bookingData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setCurrentBooking(newBooking);
    setBookings([...bookings, newBooking]);
    return newBooking;
  };

  const updateBooking = (bookingId, updates) => {
    setBookings(bookings.map(b => 
      b.id === bookingId ? { ...b, ...updates } : b
    ));
  };

  const clearCurrentBooking = () => {
    setCurrentBooking(null);
  };

  const value = {
    currentBooking,
    bookings,
    createBooking,
    updateBooking,
    clearCurrentBooking,
    setCurrentBooking
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};
