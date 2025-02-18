/**
 * Copyright 2018 The Subscribe with Google Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {ActivityIframeView} from '../ui/activity-iframe-view';
import {SubscriptionFlows} from '../api/subscriptions';
import {feArgs, feUrl} from './services';

export class LoginNotificationApi {
  /**
   * @param {!./deps.Deps} deps
   */
  constructor(deps) {
    /** @private @const {!./deps.Deps} */
    this.deps_ = deps;

    /** @private @const {!Window} */
    this.win_ = deps.win();

    /** @private @const {!../components/activities.ActivityPorts} */
    this.activityPorts_ = deps.activities();

    /** @private @const {!../components/dialog-manager.DialogManager} */
    this.dialogManager_ = deps.dialogManager();

    /** @private {?Promise} */
    this.openViewPromise_ = null;

    /** @private @const {!ActivityIframeView} */
    this.activityIframeView_ = new ActivityIframeView(
      this.win_,
      this.activityPorts_,
      feUrl('/loginiframe'),
      feArgs({
        publicationId: deps.pageConfig().getPublicationId(),
        productId: deps.pageConfig().getProductId(),
        // No need to ask the user. Just tell them you're logging them in.
        userConsent: false,
      }),
      /* shouldFadeBody */ true
    );
  }

  /**
   * Continues the Login flow (after waiting).
   * @return {!Promise}
   */
  async start() {
    this.deps_
      .callbacks()
      .triggerFlowStarted(SubscriptionFlows.SHOW_LOGIN_NOTIFICATION);

    this.openViewPromise_ = this.dialogManager_.openView(
      this.activityIframeView_
    );

    try {
      await this.activityIframeView_.acceptResult();
    } catch (reason) {
      this.dialogManager_.completeView(this.activityIframeView_);
      throw reason;
    }

    this.dialogManager_.completeView(this.activityIframeView_);
  }
}
