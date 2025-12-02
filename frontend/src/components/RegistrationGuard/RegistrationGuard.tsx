/**
 * RegistrationGuard component
 * Shows registration modal when unregistered user tries to interact with the app
 */

import { useState, useEffect, useCallback, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useOnboardingStore } from '../../stores';
import { RegistrationModal } from '../RegistrationModal';

interface RegistrationGuardProps {
  children: ReactNode;
}

export const RegistrationGuard = ({ children }: RegistrationGuardProps) => {
  const { isCompleted } = useOnboardingStore();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);

  // Pages where registration check should be skipped
  const skipCheckPaths = ['/onboarding', '/registration'];

  const shouldSkipCheck = skipCheckPaths.some((path) => location.pathname.startsWith(path));

  // Handle button clicks for unregistered users
  const handleClick = useCallback(
    (event: MouseEvent) => {
      // Skip if user is registered or on registration/onboarding pages
      if (isCompleted || shouldSkipCheck) {
        return;
      }

      const target = event.target as HTMLElement;

      // Check if clicked element is a button, link, or interactive element
      const interactiveElement =
        target.closest('button') ||
        target.closest('a[href]') ||
        (target.closest('[role="button"]') as HTMLElement);

      if (!interactiveElement) {
        return;
      }

      // Skip if element is inside registration modal or any modal
      if (
        interactiveElement.closest('[class*="RegistrationModal"]') ||
        interactiveElement.closest('[class*="modal"]') ||
        interactiveElement.closest('[class*="Modal"]')
      ) {
        return;
      }

      // Skip navigation buttons (back, close, etc.)
      const ariaLabel = interactiveElement.getAttribute('aria-label')?.toLowerCase() || '';
      const className = interactiveElement.className || '';
      const isNavigationButton =
        ariaLabel.includes('back') ||
        ariaLabel.includes('close') ||
        ariaLabel.includes('назад') ||
        ariaLabel.includes('закрыть') ||
        className.includes('backButton') ||
        className.includes('closeButton') ||
        className.includes('back-button') ||
        className.includes('close-button');

      if (isNavigationButton) {
        return;
      }

      // Skip links to registration/onboarding pages
      if (interactiveElement.tagName === 'A') {
        const href = (interactiveElement as HTMLAnchorElement).href;
        if (href.includes('/registration') || href.includes('/onboarding')) {
          return;
        }
      }

      // Skip if button has data-skip-registration-check attribute
      if (interactiveElement.hasAttribute('data-skip-registration-check')) {
        return;
      }

      // Prevent default action and show modal
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      setShowModal(true);
    },
    [isCompleted, shouldSkipCheck]
  );

  useEffect(() => {
    if (!isCompleted && !shouldSkipCheck) {
      // Add click listener to document
      document.addEventListener('click', handleClick, true); // Use capture phase

      return () => {
        document.removeEventListener('click', handleClick, true);
      };
    }
  }, [isCompleted, shouldSkipCheck, handleClick]);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  return (
    <>
      {children}
      {showModal && <RegistrationModal isOpen={showModal} onClose={handleCloseModal} />}
    </>
  );
};

