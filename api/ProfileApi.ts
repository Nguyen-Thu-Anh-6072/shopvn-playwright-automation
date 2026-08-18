import { ApiClient } from './ApiClient';
import { endpoints } from './endpoints';
import { UserProfile } from './types';

/**
 * Profile reads and writes. Scenario 6 uses this to restore the original
 * name after the UI has changed it, so the account is left as it was found.
 */
export class ProfileApi {
  constructor(private readonly client: ApiClient) {}

  async getProfile(): Promise<UserProfile> {
    return this.client.get<UserProfile>(endpoints.profile.current);
  }

  /** Update accepts multipart/form-data; a blank name leaves it unchanged. */
  async updateName(name: string): Promise<UserProfile> {
    return this.client.patchForm<UserProfile>(endpoints.profile.current, { name });
  }
}
