import validator from "validator";

const validateSignupData = (req) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName) {
    throw new Error("First name and last name are required");
  }

  if (!email || !validator.isEmail(email)) {
    throw new Error("A valid email address is required");
  }

  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }
  return true;
};

const validateProfileUpdateData = (req) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "email",
    "age",
    "gender",
    "photoUrl",
    "about",
  ];

  const isValidOperation = Object.keys(req.body).every((field) =>
    allowedEditFields.includes(field),
  );

  return isValidOperation;
};

export { validateSignupData, validateProfileUpdateData };
