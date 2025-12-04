/**
 * API Versioning Middleware
 * Handles API versioning strategy (URL path based)
 * Supports version deprecation warnings
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger';

export interface ApiVersionInfo {
  version: string;
  status: 'current' | 'deprecated' | 'sunset';
  sunsetDate?: string; // ISO date when version will be removed
  deprecationDate?: string; // ISO date when version was deprecated
}

// API versions configuration
const API_VERSIONS: Record<string, ApiVersionInfo> = {
  v1: {
    version: 'v1',
    status: 'current',
  },
  // Example for future versions:
  // 'v2': {
  //   version: 'v2',
  //   status: 'current',
  // },
  // 'v1': {
  //   version: 'v1',
  //   status: 'deprecated',
  //   deprecationDate: '2025-01-01',
  //   sunsetDate: '2025-07-01',
  // },
};

/**
 * Extract API version from request path
 */
export function extractApiVersion(req: Request): string | null {
  const match = req.path.match(/^\/api\/(v\d+)\//);
  return match ? match[1] : null;
}

/**
 * API Version middleware
 * Adds version info to request and response headers
 */
export function apiVersionMiddleware(req: Request, res: Response, next: NextFunction): void {
  const version = extractApiVersion(req);

  if (version) {
    const versionInfo = API_VERSIONS[version];

    if (!versionInfo) {
      // Version not found - return 404
      res.status(404).json({
        success: false,
        error: {
          message: `API version '${version}' not found`,
          code: 'VERSION_NOT_FOUND',
          availableVersions: Object.keys(API_VERSIONS),
        },
      });
      return;
    }

    // Add version info to request
    (req as any).apiVersion = versionInfo;

    // Add version headers to response
    res.setHeader('X-API-Version', versionInfo.version);
    res.setHeader('X-API-Status', versionInfo.status);

    // Add deprecation warnings if version is deprecated
    if (versionInfo.status === 'deprecated') {
      const warnings: string[] = [];
      warnings.push(`API version ${versionInfo.version} is deprecated`);

      if (versionInfo.deprecationDate) {
        warnings.push(`Deprecated since: ${versionInfo.deprecationDate}`);
      }

      if (versionInfo.sunsetDate) {
        warnings.push(`Will be removed on: ${versionInfo.sunsetDate}`);
      }

      res.setHeader('X-API-Deprecation-Warning', warnings.join('; '));
      res.setHeader('Warning', `299 - "API version ${versionInfo.version} is deprecated"`);

      logger.warn({
        type: 'api_version_deprecated',
        version: versionInfo.version,
        path: req.path,
        method: req.method,
      });
    }

    // Log sunset warning if version is being sunset
    if (versionInfo.status === 'sunset') {
      res.setHeader('X-API-Sunset', versionInfo.sunsetDate || '');
      logger.warn({
        type: 'api_version_sunset',
        version: versionInfo.version,
        path: req.path,
        method: req.method,
      });
    }
  } else {
    // No version in path - assume v1 for backward compatibility
    (req as any).apiVersion = API_VERSIONS['v1'];
    res.setHeader('X-API-Version', 'v1');
    res.setHeader('X-API-Status', 'current');
  }

  next();
}

/**
 * Get current API version
 */
export function getCurrentApiVersion(): string {
  const current = Object.values(API_VERSIONS).find((v) => v.status === 'current');
  return current?.version || 'v1';
}

/**
 * Get all API versions
 */
export function getAllApiVersions(): ApiVersionInfo[] {
  return Object.values(API_VERSIONS);
}
