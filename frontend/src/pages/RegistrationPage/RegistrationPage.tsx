/**
 * RegistrationPage component
 * Main registration flow controller (9 steps)
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { NameInputScreen } from './NameInputScreen';
import { DateOfBirthScreen } from './DateOfBirthScreen';
import { CitySelectionScreen } from './CitySelectionScreen';
import { GenderSelectionScreen } from './GenderSelectionScreen';
import { AboutYouScreen } from './AboutYouScreen';
import { InterestsScreen } from './InterestsScreen';
import { GoalSelectionScreen } from './GoalSelectionScreen';
import { PhotoUploadScreen } from './PhotoUploadScreen';
import { ProfilePreviewScreen } from './ProfilePreviewScreen';
import { useRegistrationStore } from '../../stores';
import type { Gender, Goal } from '../../stores/registrationStore';
import type { AboutYouFormData } from './AboutYouScreen/AboutYouScreen.types';

export const RegistrationPage = () => {
  const navigate = useNavigate();
  const { currentStep, setCurrentStep, updateData, data } = useRegistrationStore();

  const handleNameNext = useCallback(
    (name: string) => {
      updateData({ firstName: name });
      setCurrentStep(2);
    },
    [updateData, setCurrentStep]
  );

  const handleDateOfBirthNext = useCallback(
    (date: { day: string; month: string; year: string }, showAge: boolean) => {
      updateData({
        dateOfBirth: date,
        showAge,
      });
      setCurrentStep(3);
    },
    [updateData, setCurrentStep]
  );

  const handleCityNext = useCallback(
    (cityId: string) => {
      updateData({ cityId });
      setCurrentStep(4);
    },
    [updateData, setCurrentStep]
  );

  const handleGenderNext = useCallback(
    (gender: Gender) => {
      updateData({ gender });
      setCurrentStep(5);
    },
    [updateData, setCurrentStep]
  );

  const handleAboutYouNext = useCallback(
    (data: AboutYouFormData) => {
      updateData({
        jobTitle: data.jobTitle.trim() || undefined,
        company: data.company.trim() || undefined,
        bio: data.bio.trim() || undefined,
      });
      setCurrentStep(6);
      // TODO: When all steps are implemented, navigate to home only after step 9
      // For now, navigate to home after step 5
      navigate('/');
    },
    [updateData, setCurrentStep, navigate]
  );

  const handleAboutYouSkip = useCallback(() => {
    setCurrentStep(6);
  }, [setCurrentStep]);

  const handleInterestsNext = useCallback(
    (interests: string[]) => {
      updateData({ interests });
      setCurrentStep(7);
    },
    [updateData, setCurrentStep]
  );

  const handleInterestsSkip = useCallback(() => {
    setCurrentStep(7);
  }, [setCurrentStep]);

  const handleGoalNext = useCallback(
    (goal: Goal) => {
      updateData({ goal });
      setCurrentStep(8);
    },
    [updateData, setCurrentStep]
  );

  const handlePhotoNext = useCallback(
    (photoUrl: string) => {
      updateData({ photoUrl });
      setCurrentStep(9);
    },
    [updateData, setCurrentStep]
  );

  const handleProfileComplete = useCallback(() => {
    // Registration is complete, navigate to home
    navigate('/');
  }, [navigate]);

  const handleExit = useCallback(() => {
    // Exit registration and go back to home
    navigate('/');
  }, [navigate]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      // If on first step, go back to onboarding
      navigate('/onboarding');
    }
  }, [currentStep, setCurrentStep, navigate]);

  // Render current step based on currentStep
  switch (currentStep) {
    case 1:
      return (
        <NameInputScreen
          onNext={handleNameNext}
          onBack={handleBack}
          initialValue={data.firstName}
        />
      );
    case 2:
      return (
        <DateOfBirthScreen
          onNext={handleDateOfBirthNext}
          onBack={handleBack}
          onExit={handleExit}
          initialDate={data.dateOfBirth}
          initialShowAge={data.showAge}
        />
      );
    case 3:
      return (
        <CitySelectionScreen
          onNext={handleCityNext}
          onBack={handleBack}
          initialCityId={data.cityId}
        />
      );
    case 4:
      return (
        <GenderSelectionScreen
          onNext={handleGenderNext}
          onBack={handleBack}
          initialGender={data.gender}
        />
      );
    case 5:
      return (
        <AboutYouScreen
          onNext={handleAboutYouNext}
          onSkip={handleAboutYouSkip}
          onBack={handleBack}
          initialData={{
            jobTitle: data.jobTitle,
            company: data.company,
            bio: data.bio,
          }}
        />
      );
    case 6:
      return (
        <InterestsScreen
          onNext={handleInterestsNext}
          onSkip={handleInterestsSkip}
          onBack={handleBack}
          initialInterests={data.interests}
        />
      );
    case 7:
      return (
        <GoalSelectionScreen
          onNext={handleGoalNext}
          onBack={handleBack}
          initialGoal={data.goal}
        />
      );
    case 8:
      return (
        <PhotoUploadScreen
          onNext={handlePhotoNext}
          onBack={handleBack}
          initialPhotoUrl={data.photoUrl}
        />
      );
    case 9:
      return (
        <ProfilePreviewScreen
          onComplete={handleProfileComplete}
          onBack={handleBack}
        />
      );
    default:
      return (
        <NameInputScreen
          onNext={handleNameNext}
          onBack={handleBack}
          initialValue={data.firstName}
        />
      );
  }
};

