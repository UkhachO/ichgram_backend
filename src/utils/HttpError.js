const messageList = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
};

const HttpError = (status, message = messageList[status]) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

export default HttpError;
