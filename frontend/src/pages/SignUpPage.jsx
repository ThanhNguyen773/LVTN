import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  ArrowRight,
  Loader,
  Eye,
  EyeOff,
  CalendarIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useUserStore } from '../stores/useUserStore.js';
import { format, isFuture, parseISO, isValid as isValidDate } from 'date-fns';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    dateOfBirth: '',
  });

  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const { signup, loading } = useUserStore();

  const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];

  const validate = () => {
    const errs = {};

    if (!formData.name.trim()) errs.name = 'Full name is required.';
    if (!formData.email.trim()) {
      errs.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Email format is invalid.';
    }
    if (formData.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (formData.password !== formData.confirmPassword)
      errs.confirmPassword = 'Confirm password does not match.';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required.';
    if (!formData.address.trim()) errs.address = 'Address is required.';
    if (!formData.dateOfBirth) {
      errs.dateOfBirth = 'Date of birth is required.';
    } else {
      const parsed = parseISO(formData.dateOfBirth);
      if (!isValidDate(parsed)) {
        errs.dateOfBirth = 'Date of birth is invalid.';
      } else if (isFuture(parsed)) {
        errs.dateOfBirth = 'Date of birth cannot be in the future.';
      }
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    await signup(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));

    if (name === 'email') {
      const parts = value.split('@');
      if (parts.length === 1) {
        setEmailSuggestions(commonDomains.map((d) => `${value}@${d}`));
      } else if (parts.length === 2) {
        const [local, domainFragment] = parts;
        if (domainFragment === '') {
          setEmailSuggestions(commonDomains.map((d) => `${local}@${d}`));
        } else {
          const filtered = commonDomains
            .filter((d) => d.startsWith(domainFragment))
            .map((d) => `${local}@${d}`);
          setEmailSuggestions(filtered);
        }
      } else {
        setEmailSuggestions([]);
      }
    } else {
      if (emailSuggestions.length) setEmailSuggestions([]);
    }
  };

  const handleEmailBlur = () => {
    const v = formData.email.trim();
    if (v && !v.includes('@')) {
      setFormData((prev) => ({ ...prev, email: `${v}@gmail.com` }));
    }
    setEmailSuggestions([]);
  };

  const selectEmailSuggestion = (sug) => {
    setFormData((prev) => ({ ...prev, email: sug }));
    setEmailSuggestions([]);
    setFieldErrors((prev) => ({ ...prev, email: undefined }));
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <motion.div
        className="sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
      >
        <h2 className="mt-6 text-center text-3xl font-extrabold text-blue-300">
          Create your Account
        </h2>
      </motion.div>

      <motion.div
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {fieldErrors.general && (
            <p className="text-red-400 text-sm mb-4">{fieldErrors.general}</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <InputField
              icon={<User />}
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              label="Full Name"
              error={fieldErrors.name}
              autoComplete="name"
            />

            <div className="relative">
              <InputField
                icon={<Mail />}
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleEmailBlur}
                placeholder="your@example.com"
                label="Email Address"
                type="email"
                error={fieldErrors.email}
                autoComplete="email"
                aria-autocomplete="list"
              />
              {emailSuggestions.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full bg-gray-700 border border-gray-600 rounded-md max-h-40 overflow-auto text-sm">
                  {emailSuggestions.map((sug) => (
                    <li
                      key={sug}
                      className="px-3 py-2 hover:bg-gray-600 cursor-pointer"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectEmailSuggestion(sug);
                      }}
                    >
                      {sug}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <InputField
              icon={<Phone />}
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="0123456789"
              label="Phone"
              error={fieldErrors.phone}
              autoComplete="tel"
            />

            <InputField
              icon={<MapPin />}
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Your address"
              label="Address"
              error={fieldErrors.address}
              autoComplete="street-address"
            />

            <InputField
              icon={<CalendarIcon />}
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              placeholder="YYYY-MM-DD"
              label="Date of Birth"
              type="date"
              error={fieldErrors.dateOfBirth}
              max={format(new Date(), 'yyyy-MM-dd')}
              autoComplete="bday"
            />

            <InputField
              icon={<Lock />}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              label="Password"
              type="password"
              showPassword={showPassword.password}
              setShowPassword={(v) =>
                setShowPassword((prev) => ({ ...prev, password: v }))
              }
              error={fieldErrors.password}
              autoComplete="new-password"
            />

            <InputField
              icon={<Lock />}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              label="Confirm Password"
              type="password"
              showPassword={showPassword.confirmPassword}
              setShowPassword={(v) =>
                setShowPassword((prev) => ({ ...prev, confirmPassword: v }))
              }
              error={fieldErrors.confirmPassword}
              autoComplete="new-password"
            />

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent 
                rounded-md shadow-sm text-sm font-medium text-white bg-blue-400 
                hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 
                focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                  Loading...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-5 w-5" aria-hidden="true" />
                  Sign Up
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-blue-400 hover:text-blue-600"
              >
                Login here <ArrowRight className="inline h-4 w-4" />
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const InputField = ({
  icon,
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  showPassword,
  setShowPassword,
  error,
  ...rest
}) => {
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;
  const hasError = Boolean(error);
  const inputId = `input_${name}`;

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-300">
        {label}
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
        <input
          id={inputId}
          name={name}
          type={inputType}
          required
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : undefined}
          value={value}
          onChange={onChange}
          className={`block w-full pl-10 pr-10 py-2 border ${
            hasError ? 'border-red-500' : 'border-gray-500'
          } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-700 text-gray-300`}
          placeholder={placeholder}
          {...rest}
        />
        {isPassword && typeof setShowPassword === 'function' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-400"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {hasError && (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default SignUpPage;
