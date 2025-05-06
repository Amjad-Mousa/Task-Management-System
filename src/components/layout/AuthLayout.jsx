import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { DarkModeContext } from '../../Context/DarkModeContext';
import DarkModeToggle from '../DarkModeToggle';
import Card from '../ui/Card';

/**
 * AuthLayout component for sign-in and sign-up pages
 */
const AuthLayout = ({
  children,
  title,
  message = null,
  messageType = 'success',
}) => {
  const { isDarkMode } = useContext(DarkModeContext);

  return (
    <div className={`flex items-center justify-center h-screen ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'
    }`}>
      <Card className="w-80 text-center relative">
        <div className="absolute top-3 right-3">
          <DarkModeToggle />
        </div>
        <h1 className="text-2xl mb-5 font-bold">{title}</h1>
        
        {children}
        
        {message && (
          <div className={`mt-3 text-sm ${
            messageType === 'success' ? 'text-green-400' : 'text-red-400'
          }`}>
            {message}
          </div>
        )}
      </Card>
    </div>
  );
};

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string,
  messageType: PropTypes.oneOf(['success', 'error']),
};

export default AuthLayout;
