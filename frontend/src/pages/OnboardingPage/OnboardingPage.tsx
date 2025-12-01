/**
 * OnboardingPage component
 * Main onboarding flow with 3 slides + auth selection screen
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { OnboardingSlide } from '../../components/Onboarding/OnboardingSlide';
import { OnboardingAuthSelection } from '../../components/Onboarding/OnboardingAuthSelection';
import { useOnboardingStore } from '../../stores';
import { useUserStore } from '../../stores';

const TOTAL_SLIDES = 3;

export const OnboardingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { completeOnboarding, setCurrentStep } = useOnboardingStore();
  const { setUser } = useUserStore();
  const [currentStep, setStep] = useState(1);

  const handleNext = useCallback(() => {
    if (currentStep < TOTAL_SLIDES) {
      const nextStep = currentStep + 1;
      setStep(nextStep);
      setCurrentStep(nextStep);
    } else {
      // Move to auth selection screen (step 4)
      const nextStep = currentStep + 1;
      setStep(nextStep);
      setCurrentStep(nextStep);
    }
  }, [currentStep, setCurrentStep]);

  const handleTelegramAuth = useCallback(async () => {
    try {
      // Initialize Telegram Web App authentication
      if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
        const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
        
        // Save basic user data from Telegram
        const user = {
          id: tgUser.id.toString(),
          firstName: tgUser.first_name || '',
          lastName: tgUser.last_name || '',
          username: tgUser.username || '',
          // Add other fields as needed
        };

        setUser(user as any);
        completeOnboarding();
        // Navigate to registration flow
        navigate('/registration');
      } else {
        // If Telegram WebApp is not available, show error
        console.error('Telegram WebApp user data not available');
        // Still complete onboarding and navigate to registration
        completeOnboarding();
        navigate('/registration');
      }
    } catch (error) {
      console.error('Telegram auth error:', error);
      // On error, still complete onboarding and navigate to registration
      completeOnboarding();
      navigate('/registration');
    }
  }, [setUser, completeOnboarding, navigate]);

  const handleContinueGuest = useCallback(() => {
    completeOnboarding();
    navigate('/');
  }, [completeOnboarding, navigate]);

  // Show auth selection screen on step 4
  if (currentStep > TOTAL_SLIDES) {
    return (
      <OnboardingAuthSelection
        onTelegramAuth={handleTelegramAuth}
        onContinueGuest={handleContinueGuest}
      />
    );
  }

  // Render slides based on current step
  const slideData = [
    {
      step: 1,
      title: t('onboarding.slide1.title'),
      subtitle: t('onboarding.slide1.subtitle'),
    },
    {
      step: 2,
      title: t('onboarding.slide2.title'),
      subtitle: t('onboarding.slide2.subtitle'),
    },
    {
      step: 3,
      title: t('onboarding.slide3.title'),
      subtitle: t('onboarding.slide3.subtitle'),
    },
  ];

  const currentSlide = slideData[currentStep - 1];

  return (
    <OnboardingSlide
      step={currentSlide.step}
      title={currentSlide.title}
      subtitle={currentSlide.subtitle}
      illustration={null}
      buttonText={t('common.next')}
      onNext={handleNext}
      totalSteps={TOTAL_SLIDES}
    />
  );
};

