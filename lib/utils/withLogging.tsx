// @ts-nocheck
// Higher-Order Component for logging user interactions
import React, { ComponentType } from 'react';
import { logger } from '@/src/utils/logger';

// Interface for the logged component props
interface LoggedComponentProps {
  logComponentName: string;
}

// HOC function to add logging capabilities to any component
export function withLogging<P extends object>(
  WrappedComponent: ComponentType<P>,
  componentName: string
) {
  // Create a new component that wraps the original component
  const LoggedComponent: React.FC<P & Partial<LoggedComponentProps>> = (props) => {
    // Log when the component mounts
    React.useEffect(() => {
      logger.logInfo(`${componentName} mounted`, {
        component: componentName,
        props: Object.keys(props),
      }, componentName);

      // Log when the component unmounts
      return () => {
        logger.logInfo(`${componentName} unmounted`, {
          component: componentName,
        }, componentName);
      };
    }, []);

    // Log prop changes
    React.useEffect(() => {
      logger.logDebug(`${componentName} props updated`, {
        component: componentName,
        props: props,
      }, componentName);
    }, [props]);

    // Render the original component with additional logging props
    return <WrappedComponent {...props as P} logComponentName={componentName} />;
  };

  // Set display name for debugging
  LoggedComponent.displayName = `Logged(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return LoggedComponent;
}

// Hook for functional components to add logging
export const useComponentLogger = (componentName: string) => {
  React.useEffect(() => {
    logger.logInfo(`${componentName} mounted`, {
      component: componentName,
    }, componentName);

    return () => {
      logger.logInfo(`${componentName} unmounted`, {
        component: componentName,
      }, componentName);
    };
  }, [componentName]);

  // Function to log custom events within the component
  const logEvent = (eventName: string, data?: any) => {
    logger.logUserInteraction(eventName, componentName, componentName, {
      component: componentName,
      event: eventName,
      ...data,
    });
  };

  return { logEvent };
};

// Hook for logging screen views
export const useScreenLogger = (screenName: string) => {
  React.useEffect(() => {
    logger.logScreenView(screenName, {
      screen: screenName,
    });
  }, [screenName]);
};