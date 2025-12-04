/**
 * Business Metrics Service
 * Tracks key business metrics: conversion rate, match rate, time to match, DAU
 */

import { logger } from '../logger';
import { userRepository } from '../repositories/userRepository';
import { likeRepository } from '../repositories/likeRepository';
import { matchRepository } from '../repositories/matchRepository';

export interface BusinessMetrics {
  conversionRate: number; // Registration → First like
  matchRate: number; // Likes → Matches
  averageTimeToMatch: number; // Minutes from registration to first match
  dailyActiveUsers: number; // DAU
  totalUsers: number;
  totalMatches: number;
  totalLikes: number;
}

/**
 * Calculate conversion rate (registration → first like)
 */
export async function calculateConversionRate(startDate?: Date, endDate?: Date): Promise<number> {
  try {
    // Get all users registered in the period
    const allUsers = await userRepository.getAllUsersUnpaginated();
    const periodUsers = allUsers.filter((user) => {
      if (!startDate && !endDate) return true;
      const userDate = new Date(user.createdAt);
      if (startDate && userDate < startDate) return false;
      if (endDate && userDate > endDate) return false;
      return true;
    });

    if (periodUsers.length === 0) return 0;

    // Count users who made at least one like
    let usersWithLikes = 0;
    for (const user of periodUsers) {
      const userLikes = await likeRepository.getLikesByUserId(user.id, 1, 0);
      if (userLikes.length > 0) {
        usersWithLikes++;
      }
    }

    const rate = (usersWithLikes / periodUsers.length) * 100;
    return Math.round(rate * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    logger.error({ error, type: 'metrics_calculation_error', metric: 'conversion_rate' });
    return 0;
  }
}

/**
 * Calculate match rate (likes → matches)
 */
export async function calculateMatchRate(startDate?: Date, endDate?: Date): Promise<number> {
  try {
    // Get all likes in the period
    const allLikes = await likeRepository.getAllLikes();
    const periodLikes = allLikes.filter((like) => {
      if (!startDate && !endDate) return true;
      const likeDate = new Date(like.createdAt);
      if (startDate && likeDate < startDate) return false;
      if (endDate && likeDate > endDate) return false;
      return true;
    });

    if (periodLikes.length === 0) return 0;

    // Get all matches in the period
    const allMatches = await matchRepository.getAllMatches();
    const periodMatches = allMatches.filter((match) => {
      if (!startDate && !endDate) return true;
      const matchDate = new Date(match.createdAt);
      if (startDate && matchDate < startDate) return false;
      if (endDate && matchDate > endDate) return false;
      return true;
    });

    const rate = (periodMatches.length / periodLikes.length) * 100;
    return Math.round(rate * 100) / 100;
  } catch (error) {
    logger.error({ error, type: 'metrics_calculation_error', metric: 'match_rate' });
    return 0;
  }
}

/**
 * Calculate average time to match (registration → first match)
 */
export async function calculateAverageTimeToMatch(): Promise<number> {
  try {
    const allUsers = await userRepository.getAllUsers();
    const allMatches = await matchRepository.getAllMatches();

    const timesToMatch: number[] = [];

    for (const user of allUsers) {
      // Find user's first match
      const userMatches = allMatches.filter(
        (match) => match.userId1 === user.id || match.userId2 === user.id
      );

      if (userMatches.length > 0) {
        // Sort by creation date
        userMatches.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        const firstMatch = userMatches[0];

        // Calculate time difference in minutes
        const registrationTime = new Date(user.createdAt).getTime();
        const matchTime = new Date(firstMatch.createdAt).getTime();
        const minutesDiff = (matchTime - registrationTime) / (1000 * 60);

        if (minutesDiff > 0) {
          timesToMatch.push(minutesDiff);
        }
      }
    }

    if (timesToMatch.length === 0) return 0;

    const average = timesToMatch.reduce((sum, time) => sum + time, 0) / timesToMatch.length;
    return Math.round(average);
  } catch (error) {
    logger.error({ error, type: 'metrics_calculation_error', metric: 'time_to_match' });
    return 0;
  }
}

/**
 * Calculate Daily Active Users (DAU)
 */
export async function calculateDAU(date?: Date): Promise<number> {
  try {
    const targetDate = date || new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Count users who were active (made at least one like or match) on the target date
    const activeUserIds = new Set<string>();

    // Check likes
    const allLikes = await likeRepository.getAllLikes();
    for (const like of allLikes) {
      const likeDate = new Date(like.createdAt);
      if (likeDate >= startOfDay && likeDate <= endOfDay) {
        activeUserIds.add(like.fromUserId);
      }
    }

    // Check matches
    const allMatches = await matchRepository.getAllMatches();
    for (const match of allMatches) {
      const matchDate = new Date(match.createdAt);
      if (matchDate >= startOfDay && matchDate <= endOfDay) {
        activeUserIds.add(match.userId1);
        activeUserIds.add(match.userId2);
      }
    }

    return activeUserIds.size;
  } catch (error) {
    logger.error({ error, type: 'metrics_calculation_error', metric: 'dau' });
    return 0;
  }
}

/**
 * Get all business metrics
 */
export async function getBusinessMetrics(
  startDate?: Date,
  endDate?: Date
): Promise<BusinessMetrics> {
  try {
    const [conversionRate, matchRate, averageTimeToMatch, dau] = await Promise.all([
      calculateConversionRate(startDate, endDate),
      calculateMatchRate(startDate, endDate),
      calculateAverageTimeToMatch(),
      calculateDAU(),
    ]);

    const allUsers = await userRepository.getAllUsersUnpaginated();
    const allMatches = await matchRepository.getAllMatches();
    const allLikes = await likeRepository.getAllLikes();

    return {
      conversionRate,
      matchRate,
      averageTimeToMatch,
      dailyActiveUsers: dau,
      totalUsers: allUsers.length,
      totalMatches: allMatches.length,
      totalLikes: allLikes.length,
    };
  } catch (error) {
    logger.error({ error, type: 'metrics_calculation_error', metric: 'all' });
    throw error;
  }
}

/**
 * Log business metrics (for monitoring)
 */
export async function logBusinessMetrics(): Promise<void> {
  try {
    const metrics = await getBusinessMetrics();

    logger.info({
      type: 'business_metrics',
      metrics: {
        conversionRate: `${metrics.conversionRate}%`,
        matchRate: `${metrics.matchRate}%`,
        averageTimeToMatch: `${metrics.averageTimeToMatch} minutes`,
        dailyActiveUsers: metrics.dailyActiveUsers,
        totalUsers: metrics.totalUsers,
        totalMatches: metrics.totalMatches,
        totalLikes: metrics.totalLikes,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error({ error, type: 'metrics_logging_error' });
  }
}
