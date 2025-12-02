const generateLineItems = (items) => {
  return items.map((item) => {
    return {
      price_data: {
        currency: "usd",
        unit_amount: 50 * 100, // $50 per ticket
        product_data: {
          name: "VIP Ticket - Tech Conference 2025",
          description: "Access to all sessions + VIP lounge",
          metadata: {
            eventId: "674ab90df123f",
            eventTitle: "Tech Conference 2025",
            ticketTypeId: "VIP-123",
            eventDate: "2025-02-12",
            eventTime: "10:00",
          },
        },
      },
      quantity: 5,
      metadata: {
        userId: "USR-55",
        orderId: "ORDitem-90125",
      },
    };
  });
};

export default generateLineItems;
