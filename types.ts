
export enum SystemStatus {
  IDLE = 'IDLE',
  DEPLOYING = 'DEPLOYING',
  HEALTHY = 'HEALTHY',
  UNHEALTHY = 'UNHEALTHY',
  ROLLING_BACK = 'ROLLING_BACK',
  MAINTENANCE = 'MAINTENANCE'
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'error' | 'success' | 'command' | 'warning';
  message: string;
}

export interface DeploymentRecord {
  id: string;
  version: string;
  timestamp: Date;
  status: 'success' | 'failure' | 'rollback';
  duration: string;
}

export interface ServerHealth {
  cpu: number;
  memory: number;
  uptime: string;
  connections: number;
}
