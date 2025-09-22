export const emailValidation = {
  regexp: {
    value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    message: 'Invalid email',
  },
};

export const passwordValidation = {
  regexp: {
    value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9]+$/,
    message: 'Must contain letter & number',
  },
  min: {value: 8, message: 'Min length 8'};
};