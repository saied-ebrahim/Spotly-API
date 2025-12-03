const generateLineItems = ({ ticketPrice, quantity, eventTitle, ticketTitle, eventDate, eventTime, eventID, ticketID, userID, orderID }) => {
  return {
    price_data: {
      currency: "usd",
      unit_amount: ticketPrice * 100, // $50 per ticket
      product_data: {
        name: ticketTitle,
        metadata: {
          eventId: eventID,
          eventTitle: eventTitle,
          ticketTypeId: ticketID,
          eventDate: eventDate,
          eventTime: eventTime,
        },
      },
    },
    quantity: quantity,
    metadata: {
      userId: userID,
      orderId: orderID,
    },
  };
};

export default generateLineItems;
