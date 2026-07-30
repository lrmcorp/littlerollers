// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'serializers.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

Serializers _$serializers =
    (Serializers().toBuilder()
          ..add($AccessReason.serializer)
          ..add($Branch.serializer)
          ..add($CustomerRescheduleSlot.serializer)
          ..add($EffectivePeriod.serializer)
          ..add($Package.serializer)
          ..add($PackagePromotionCommand.serializer)
          ..add($PaymentAccount.serializer)
          ..add($PublicBranch.serializer)
          ..add($PublicClassProfile.serializer)
          ..add($PublicPackageSummary.serializer)
          ..add($PublicScheduleSummary.serializer)
          ..add($Purchase.serializer)
          ..add($SessionBranch.serializer)
          ..add($VoucherCommand.serializer)
          ..add(AcceptedStatus.serializer)
          ..add(AccessReasonCode.serializer)
          ..add(AccessRoleAssignmentInput.serializer)
          ..add(AccessRoleCapability.serializer)
          ..add(AccessRoleDefinition.serializer)
          ..add(AccessRolePage.serializer)
          ..add(AccessRoleScope.serializer)
          ..add(AccountLinkCommand.serializer)
          ..add(AccountLinkCommandProviderEnum.serializer)
          ..add(ActionCommand.serializer)
          ..add(AdjustmentActor.serializer)
          ..add(AdjustmentCommand.serializer)
          ..add(AdjustmentCommandReasonCodeEnum.serializer)
          ..add(AdjustmentCustomer.serializer)
          ..add(AdjustmentDecisionResult.serializer)
          ..add(AdjustmentNamedReference.serializer)
          ..add(ApprovalResult.serializer)
          ..add(ApprovePurchaseRequest.serializer)
          ..add(ApprovePurchaseRequestReasonCodeEnum.serializer)
          ..add(AssignInstructorCommand.serializer)
          ..add(Assignment.serializer)
          ..add(AssignmentAssignmentTypeEnum.serializer)
          ..add(AssignmentCommand.serializer)
          ..add(AssignmentCommandAssignmentTypeEnum.serializer)
          ..add(AssignmentManagementBranch.serializer)
          ..add(AssignmentManagementSummary.serializer)
          ..add(AssignmentManagementUser.serializer)
          ..add(AssignmentPage.serializer)
          ..add(AssignmentPagePage.serializer)
          ..add(AssignmentStatusEnum.serializer)
          ..add(AttachOrderProofCommand.serializer)
          ..add(AuditActorProjection.serializer)
          ..add(AuditBranchProjection.serializer)
          ..add(AuditExport.serializer)
          ..add(AuditExportCommand.serializer)
          ..add(AuditExportCommandFormatEnum.serializer)
          ..add(AuditExportStatusEnum.serializer)
          ..add(AuditLog.serializer)
          ..add(AuditLogActorTypeEnum.serializer)
          ..add(AuditLogPage.serializer)
          ..add(AuditTargetProjection.serializer)
          ..add(AuthSecurityStatus.serializer)
          ..add(AuthorizeIdentityVerificationView200Response.serializer)
          ..add(Availability.serializer)
          ..add(AvailabilityPage.serializer)
          ..add(AvailabilityStatusEnum.serializer)
          ..add(BackfillCustomerCheckInRequest.serializer)
          ..add(Booking.serializer)
          ..add(BookingAttendance.serializer)
          ..add(BookingAttendanceSource_Enum.serializer)
          ..add(BookingBranch.serializer)
          ..add(BookingCancellationReasonCodeEnum.serializer)
          ..add(BookingClassSlot.serializer)
          ..add(BookingCommand.serializer)
          ..add(BookingCommandSource_Enum.serializer)
          ..add(BookingCustomer.serializer)
          ..add(BookingManagementSummary.serializer)
          ..add(BookingPage.serializer)
          ..add(BookingReservedQuantityEnum.serializer)
          ..add(BookingSessionBalance.serializer)
          ..add(BookingSource_Enum.serializer)
          ..add(BookingStatusEnum.serializer)
          ..add(BranchAuditActivity.serializer)
          ..add(BranchCommand.serializer)
          ..add(BranchDependencySummary.serializer)
          ..add(BranchManagementDetail.serializer)
          ..add(BranchManagementSummary.serializer)
          ..add(BranchPage.serializer)
          ..add(BranchPeriod.serializer)
          ..add(BranchPeriodPage.serializer)
          ..add(BranchPeriodStatusEnum.serializer)
          ..add(BranchPublicProfileSummary.serializer)
          ..add(BranchUpdateCommand.serializer)
          ..add(BulkCustomerCheckInLinkCommand.serializer)
          ..add(BulkCustomerCheckInLinkItem.serializer)
          ..add(BulkCustomerCheckInLinkResult.serializer)
          ..add(CancelBookingCommand.serializer)
          ..add(CancelBookingCommandReasonCodeEnum.serializer)
          ..add(CapabilityDefinition.serializer)
          ..add(CapabilityDefinitionPage.serializer)
          ..add(ChallengeAccepted.serializer)
          ..add(ChallengeExpiry.serializer)
          ..add(ChangedStatus.serializer)
          ..add(CheckInResult.serializer)
          ..add(CheckInResultBranch.serializer)
          ..add(CheckInResultPurposeEnum.serializer)
          ..add(CheckInToken.serializer)
          ..add(CheckInTokenAudienceTypeEnum.serializer)
          ..add(CheckInTokenPurposeEnum.serializer)
          ..add(CheckInTokenResourceTypeEnum.serializer)
          ..add(CheckInTokenStatus.serializer)
          ..add(CheckInTokenStatusEnum.serializer)
          ..add(CheckInTokenStatusPurposeEnum.serializer)
          ..add(CheckInTokenStatusResourceTypeEnum.serializer)
          ..add(CheckInTokenStatusStatusEnum.serializer)
          ..add(CheckoutOptions.serializer)
          ..add(CheckoutOptionsPackage.serializer)
          ..add(CheckoutOptionsPaymentAccount.serializer)
          ..add(ClassSlot.serializer)
          ..add(ClassSlotCancellationCommand.serializer)
          ..add(ClassSlotCancellationCommandReasonCodeEnum.serializer)
          ..add(ClassSlotCancellationReasonCodeEnum.serializer)
          ..add(ClassSlotCommand.serializer)
          ..add(ClassSlotPage.serializer)
          ..add(ClassSlotStatusEnum.serializer)
          ..add(ClassSlotUpdateCommand.serializer)
          ..add(ClassSlotVersionCommand.serializer)
          ..add(ClassType.serializer)
          ..add(ClassTypeCommand.serializer)
          ..add(ClassTypePage.serializer)
          ..add(ClassTypeUpdateCommand.serializer)
          ..add(CloseMonthRequest.serializer)
          ..add(CloseResult.serializer)
          ..add(CompleteClassCommand.serializer)
          ..add(CompletionResult.serializer)
          ..add(Correction.serializer)
          ..add(CorrectionCommand.serializer)
          ..add(CorrectionDecisionResult.serializer)
          ..add(CorrectionStatusEnum.serializer)
          ..add(CreateAccessRoleCommand.serializer)
          ..add(CreateOrderCommand.serializer)
          ..add(CreatePaymentProofUploadRequest.serializer)
          ..add(CreatePermissionOverrideCommand.serializer)
          ..add(CreatePermissionOverrideCommandEffectEnum.serializer)
          ..add(CursorPageMeta.serializer)
          ..add(CustomerBookingCancellationOptions.serializer)
          ..add(CustomerBookingCancellationOptionsSupportActionEnum.serializer)
          ..add(
            CustomerBookingCancellationOptionsUnavailableReasonEnum.serializer,
          )
          ..add(CustomerBookingEligibility.serializer)
          ..add(CustomerBookingEligibilityReasonCodeEnum.serializer)
          ..add(CustomerBookingEligibilityRequiredActionEnum.serializer)
          ..add(CustomerBookingOptions.serializer)
          ..add(CustomerBookingPackage.serializer)
          ..add(CustomerBookingSlot.serializer)
          ..add(CustomerBookingSlotBranch.serializer)
          ..add(CustomerBookingSlotClassType.serializer)
          ..add(CustomerBookingSlotStatusEnum.serializer)
          ..add(CustomerCheckInIssue.serializer)
          ..add(CustomerCheckInIssueStatusEnum.serializer)
          ..add(CustomerCheckInTokenStatus.serializer)
          ..add(CustomerCheckInTokenStatusStatusEnum.serializer)
          ..add(CustomerDashboardOverview.serializer)
          ..add(CustomerDashboardOverviewActionableOrdersInner.serializer)
          ..add(
            CustomerDashboardOverviewActionableOrdersInnerStatusEnum.serializer,
          )
          ..add(CustomerDashboardOverviewPackagesInner.serializer)
          ..add(CustomerDashboardOverviewUpcomingBookingsInner.serializer)
          ..add(CustomerDashboardOverviewVerification.serializer)
          ..add(CustomerDashboardOverviewVerificationDocumentsInner.serializer)
          ..add(
            CustomerDashboardOverviewVerificationDocumentsInnerKindEnum
                .serializer,
          )
          ..add(CustomerDashboardOverviewVerificationStatusEnum.serializer)
          ..add(CustomerLookupOption.serializer)
          ..add(CustomerLookupOptionMetadata.serializer)
          ..add(CustomerLookupOptionMetadataVerificationStatusEnum.serializer)
          ..add(CustomerLookupPage.serializer)
          ..add(CustomerOrderActivation.serializer)
          ..add(CustomerOrderSummary.serializer)
          ..add(CustomerOrderTimelineItem.serializer)
          ..add(CustomerOrderTimelineItemTypeEnum.serializer)
          ..add(CustomerOrderTimelinePage.serializer)
          ..add(CustomerPackageBalance.serializer)
          ..add(CustomerPackageBalancePage.serializer)
          ..add(CustomerPackageBalanceStatusEnum.serializer)
          ..add(CustomerPackageBalanceSummary.serializer)
          ..add(CustomerRescheduleOptions.serializer)
          ..add(CustomerRescheduleOptionsSupportActionEnum.serializer)
          ..add(CustomerRescheduleOptionsUnavailableReasonEnum.serializer)
          ..add(CustomerRescheduleSlotStatusEnum.serializer)
          ..add(CustomerRescheduleTarget.serializer)
          ..add(DashboardActivityItem.serializer)
          ..add(DashboardBranchPerformance.serializer)
          ..add(DashboardMetric.serializer)
          ..add(DashboardMetricUnitEnum.serializer)
          ..add(DashboardOverview.serializer)
          ..add(DashboardOverviewPeriod.serializer)
          ..add(DashboardOverviewRoleFocusEnum.serializer)
          ..add(DashboardQueueSummary.serializer)
          ..add(DashboardRiskItem.serializer)
          ..add(DashboardSections.serializer)
          ..add(DashboardTrendPoint.serializer)
          ..add(DecideCorrectionRequest.serializer)
          ..add(DeleteIdentityVerificationFileRequest.serializer)
          ..add(DownloadAuthorization.serializer)
          ..add(EffectiveCapabilityDenial.serializer)
          ..add(EffectiveCapabilityGrant.serializer)
          ..add(EffectiveCapabilityGrantSource_Enum.serializer)
          ..add(EffectiveSetting.serializer)
          ..add(EffectiveSettingCommand.serializer)
          ..add(EffectiveSettingKindEnum.serializer)
          ..add(EffectiveSettingPage.serializer)
          ..add(EnabledStatus.serializer)
          ..add(EndAssignmentCommand.serializer)
          ..add(ErrorEnvelope.serializer)
          ..add(ErrorEnvelopeError.serializer)
          ..add(ErrorEnvelopeErrorDetailsInner.serializer)
          ..add(FinalizeUploadCommand.serializer)
          ..add(FinanceAnomaly.serializer)
          ..add(FinanceAnomalyCodeEnum.serializer)
          ..add(FinanceAnomalySeverityEnum.serializer)
          ..add(FinanceBranchReconciliation.serializer)
          ..add(FinanceReconciliationMetric.serializer)
          ..add(FinanceReconciliationOverview.serializer)
          ..add(FinanceReconciliationOverviewPeriod.serializer)
          ..add(FinancialReport.serializer)
          ..add(FinancialReportPage.serializer)
          ..add(FinancialReportReportTypeEnum.serializer)
          ..add(GetFinanceReconciliationAnomalies200Response.serializer)
          ..add(GetMyNotificationUnreadCount200Response.serializer)
          ..add(GoogleAuthRequest.serializer)
          ..add(GoogleAuthRequestChannelEnum.serializer)
          ..add(HealthResult.serializer)
          ..add(HealthResultDependenciesInner.serializer)
          ..add(HealthResultDependenciesInnerStatusEnum.serializer)
          ..add(HealthResultStatusEnum.serializer)
          ..add(IdentityDocumentSelfViewAuthorization.serializer)
          ..add(IdentityVerificationDecisionCommand.serializer)
          ..add(IdentityVerificationDecisionCommandReasonCodeEnum.serializer)
          ..add(IdentityVerificationDeletionResult.serializer)
          ..add(IdentityVerificationDeletionResultStatusEnum.serializer)
          ..add(IdentityVerificationDocument.serializer)
          ..add(IdentityVerificationDocumentKindEnum.serializer)
          ..add(IdentityVerificationDocumentScanStatusEnum.serializer)
          ..add(IdentityVerificationDocumentStatusEnum.serializer)
          ..add(IdentityVerificationDocumentUploadStatusEnum.serializer)
          ..add(IdentityVerificationReviewCase.serializer)
          ..add(IdentityVerificationReviewCaseVerificationStatusEnum.serializer)
          ..add(IdentityVerificationReviewPage.serializer)
          ..add(IdentityVerificationReviewSummary.serializer)
          ..add(IdentityVerificationReviewUser.serializer)
          ..add(IdentityVerificationReviewUserStatusEnum.serializer)
          ..add(IdentityVerificationSummary.serializer)
          ..add(IdentityVerificationSummaryStatusEnum.serializer)
          ..add(InstructorFeeCommand.serializer)
          ..add(InternalPackageDetail.serializer)
          ..add(InviteUserRequest.serializer)
          ..add(IssueCustomerCheckInLinkCommand.serializer)
          ..add(LedgerEntry.serializer)
          ..add(LedgerEntryTypeEnum.serializer)
          ..add(ListPaymentAccounts200Response.serializer)
          ..add(LookupOption.serializer)
          ..add(LookupOptionMetadata.serializer)
          ..add(LookupPage.serializer)
          ..add(MarkAllMyNotificationsRead200Response.serializer)
          ..add(Me.serializer)
          ..add(MeIdentityVerificationStatusEnum.serializer)
          ..add(MigrationBatchActionCommand.serializer)
          ..add(MigrationBatchCommand.serializer)
          ..add(MigrationBatchCommandModeEnum.serializer)
          ..add(MigrationBatchPage.serializer)
          ..add(MigrationBatchResult.serializer)
          ..add(MigrationBatchResultStatusEnum.serializer)
          ..add(MigrationControlTotals.serializer)
          ..add(MigrationSourceUpload.serializer)
          ..add(MigrationSourceUploadCommand.serializer)
          ..add(MigrationSourceUploadCommandSourceTypeEnum.serializer)
          ..add(MigrationSourceUploadScanStatusEnum.serializer)
          ..add(MigrationSourceUploadStatusEnum.serializer)
          ..add(MobileFeatures.serializer)
          ..add(Money.serializer)
          ..add(MyProfile.serializer)
          ..add(NotificationAttempt.serializer)
          ..add(NotificationAttemptStatusEnum.serializer)
          ..add(NotificationDeliveryMetrics.serializer)
          ..add(NotificationOccurrence.serializer)
          ..add(NotificationOccurrencePage.serializer)
          ..add(NotificationOccurrenceStatusEnum.serializer)
          ..add(NotificationRetryResult.serializer)
          ..add(OperationalJob.serializer)
          ..add(OperationalJobPage.serializer)
          ..add(OperationalJobResult.serializer)
          ..add(OperationalJobResultStatusEnum.serializer)
          ..add(OperationalJobStatusEnum.serializer)
          ..add(Order.serializer)
          ..add(OrderPage.serializer)
          ..add(OrderPaymentAccount.serializer)
          ..add(OrderPaymentProofStatus.serializer)
          ..add(OrderPaymentProofStatusScanStatusEnum.serializer)
          ..add(OrderPaymentProofStatusUploadStatusEnum.serializer)
          ..add(OrderPromotion.serializer)
          ..add(OrderPromotionDiscountTypeEnum.serializer)
          ..add(OrderStatusEnum.serializer)
          ..add(OtherCost.serializer)
          ..add(OtherCostCommand.serializer)
          ..add(OtherCostPage.serializer)
          ..add(OtherCostStatusEnum.serializer)
          ..add(OtpRequest.serializer)
          ..add(OtpVerifyRequest.serializer)
          ..add(PackageCommand.serializer)
          ..add(PackageEffectiveStateEnum.serializer)
          ..add(PackageLedgerResult.serializer)
          ..add(PackageManagementSummary.serializer)
          ..add(PackagePage.serializer)
          ..add(PackagePromotion.serializer)
          ..add(PackagePromotionCommandDiscountTypeEnum.serializer)
          ..add(PackagePromotionDiscountTypeEnum.serializer)
          ..add(PackagePromotionEffectiveStateEnum.serializer)
          ..add(PackagePromotionOrderPage.serializer)
          ..add(PackagePromotionOrderPageItemsInner.serializer)
          ..add(PackagePromotionPage.serializer)
          ..add(PackagePromotionStatusEnum.serializer)
          ..add(PackagePromotionUpdateCommand.serializer)
          ..add(PackageRevisionCommand.serializer)
          ..add(PackageStatusEnum.serializer)
          ..add(PackageUpdateCommand.serializer)
          ..add(Page.serializer)
          ..add(PagePage.serializer)
          ..add(PasswordChangeCommand.serializer)
          ..add(PasswordResetRequest.serializer)
          ..add(PasswordSessionRequest.serializer)
          ..add(PasswordSessionRequestChannelEnum.serializer)
          ..add(PasswordSetupRequest.serializer)
          ..add(PasswordTokenCommand.serializer)
          ..add(PaymentAccountCommand.serializer)
          ..add(PaymentAccountDetail.serializer)
          ..add(PaymentAccountDetailAllOfBranch.serializer)
          ..add(PaymentActivationResult.serializer)
          ..add(PaymentActivationResultStatusEnum.serializer)
          ..add(PaymentActivationSummary.serializer)
          ..add(PaymentActivationSummaryStatusEnum.serializer)
          ..add(PaymentProof.serializer)
          ..add(PaymentProofScanStatusEnum.serializer)
          ..add(PaymentProofUploadInstruction.serializer)
          ..add(PaymentProofUploadStatusEnum.serializer)
          ..add(PaymentProofViewAuthorization.serializer)
          ..add(PaymentReviewBranch.serializer)
          ..add(PaymentReviewCustomer.serializer)
          ..add(PaymentReviewDetail.serializer)
          ..add(PaymentReviewItem.serializer)
          ..add(PaymentReviewPage.serializer)
          ..add(PaymentReviewProof.serializer)
          ..add(PaymentReviewProofScanStatusEnum.serializer)
          ..add(PaymentReviewProofUploadStatusEnum.serializer)
          ..add(PaymentReviewSummary.serializer)
          ..add(PaymentReviewTimeline.serializer)
          ..add(PaymentUsageHistoryItem.serializer)
          ..add(PaymentUsageHistoryItemTypeEnum.serializer)
          ..add(PaymentUsageHistoryPage.serializer)
          ..add(PreferredStudio.serializer)
          ..add(ProjectionRateCommand.serializer)
          ..add(PublicBranchProfile.serializer)
          ..add(PublicBranchProfileOpeningHoursInner.serializer)
          ..add(PublicCatalogRange.serializer)
          ..add(PublicClassCatalog.serializer)
          ..add(PublicClassDetail.serializer)
          ..add(PublicClassMarketingSummary.serializer)
          ..add(PublicClassTypeRef.serializer)
          ..add(PublicPackageCatalog.serializer)
          ..add(PublicPackageDetail.serializer)
          ..add(PublicPackageProfile.serializer)
          ..add(PublicPackagePromotion.serializer)
          ..add(PublicPackagePromotionDiscountTypeEnum.serializer)
          ..add(PublicScheduleDetail.serializer)
          ..add(PublicScheduleSummaryInstructor.serializer)
          ..add(PublicScheduleSummaryStatusEnum.serializer)
          ..add(PublicSiteConfig.serializer)
          ..add(PublicStudioDetail.serializer)
          ..add(PublicStudioDetailAllOfClasses.serializer)
          ..add(PurchasePackagePromotionDiscountTypeSnapshotEnum.serializer)
          ..add(PurchasePage.serializer)
          ..add(PurchaseStatusEnum.serializer)
          ..add(PurchaseVoucherDiscountTypeSnapshotEnum.serializer)
          ..add(QuotaCapacityCommand.serializer)
          ..add(QuotaEvaluationCommand.serializer)
          ..add(QuotaEvaluationResult.serializer)
          ..add(QuotaEvaluationResultStatusEnum.serializer)
          ..add(ReasonedVersionCommand.serializer)
          ..add(RecoveryRequestCommand.serializer)
          ..add(RecoveryRequestCommandRequestedChannelEnum.serializer)
          ..add(RecoveryVerifyCommand.serializer)
          ..add(RecoveryVerifyCommandNewVerifiedIdentity.serializer)
          ..add(ReplacePaymentProofCommand.serializer)
          ..add(ReplaceRoleCapabilitiesCommand.serializer)
          ..add(ReplaceUserAccessRolesCommand.serializer)
          ..add(Reschedule.serializer)
          ..add(RescheduleDecisionCommand.serializer)
          ..add(RescheduleDecisionCommandReasonCodeEnum.serializer)
          ..add(RescheduleDecisionReasonCodeEnum.serializer)
          ..add(RescheduleDecisionResult.serializer)
          ..add(RescheduleEntitledAtRequestEnum.serializer)
          ..add(ReschedulePage.serializer)
          ..add(RescheduleRequestCommand.serializer)
          ..add(RescheduleRequestCommandReasonCodeEnum.serializer)
          ..add(RescheduleRequestReasonCodeEnum.serializer)
          ..add(RescheduleStatusEnum.serializer)
          ..add(ReservationSummary.serializer)
          ..add(Resource.serializer)
          ..add(RevokeCustomerCheckInTokenCommand.serializer)
          ..add(RevokeSessionsCommand.serializer)
          ..add(Role.serializer)
          ..add(RoleCatalog.serializer)
          ..add(RoleCatalogItem.serializer)
          ..add(RoleCatalogItemScopeEnum.serializer)
          ..add(SafeAuditActivity.serializer)
          ..add(Session.serializer)
          ..add(SessionAdjustment.serializer)
          ..add(SessionAdjustmentDecisionCodeEnum.serializer)
          ..add(SessionAdjustmentDecisionCommand.serializer)
          ..add(SessionAdjustmentDecisionCommandReasonCodeEnum.serializer)
          ..add(SessionAdjustmentPage.serializer)
          ..add(SessionAdjustmentReasonCodeEnum.serializer)
          ..add(SessionAdjustmentStatusEnum.serializer)
          ..add(SessionChannelEnum.serializer)
          ..add(SubmitPurchaseRequest.serializer)
          ..add(TimeRangeCommand.serializer)
          ..add(TokenCheckInCommand.serializer)
          ..add(UpdateAccessRoleCommand.serializer)
          ..add(UpdateMyProfileCommand.serializer)
          ..add(UpdateUserProfileRequest.serializer)
          ..add(UpdateUserRolesCommand.serializer)
          ..add(UserAccess.serializer)
          ..add(UserAccessEffective.serializer)
          ..add(UserAccessRoleAssignment.serializer)
          ..add(UserAccessRoleAssignmentBranch.serializer)
          ..add(UserAccessRoleAssignmentSource_Enum.serializer)
          ..add(UserAccessUser.serializer)
          ..add(UserAccessUserStatusEnum.serializer)
          ..add(UserListSummary.serializer)
          ..add(UserNotification.serializer)
          ..add(UserNotificationCategoryEnum.serializer)
          ..add(UserNotificationPage.serializer)
          ..add(UserNotificationToneEnum.serializer)
          ..add(UserPage.serializer)
          ..add(UserPermissionOverride.serializer)
          ..add(UserPermissionOverrideEffectEnum.serializer)
          ..add(UserRoleInput.serializer)
          ..add(UserRoleSummary.serializer)
          ..add(UserRoleSummaryBranch.serializer)
          ..add(UserRoleSummarySource_Enum.serializer)
          ..add(UserSummary.serializer)
          ..add(UserSummaryAudienceEnum.serializer)
          ..add(UserSummaryStatusEnum.serializer)
          ..add(UserVerificationDocumentSummary.serializer)
          ..add(UserVerificationDocumentSummaryKindEnum.serializer)
          ..add(UserVerificationSummary.serializer)
          ..add(UserVerificationSummaryStatusEnum.serializer)
          ..add(VersionCommand.serializer)
          ..add(VersionedAccessReason.serializer)
          ..add(Voucher.serializer)
          ..add(VoucherCommandDiscountTypeEnum.serializer)
          ..add(VoucherDiscountTypeEnum.serializer)
          ..add(VoucherPackagesInner.serializer)
          ..add(VoucherPage.serializer)
          ..add(VoucherPreview.serializer)
          ..add(VoucherPreviewCommand.serializer)
          ..add(VoucherPreviewValidEnum.serializer)
          ..add(VoucherRedemption.serializer)
          ..add(VoucherRedemptionPage.serializer)
          ..add(VoucherStatusEnum.serializer)
          ..add(VoucherUpdateCommand.serializer)
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(AccessRoleCapability),
            ]),
            () => ListBuilder<AccessRoleCapability>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(AccessRoleDefinition),
            ]),
            () => ListBuilder<AccessRoleDefinition>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(Assignment)]),
            () => ListBuilder<Assignment>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(AuditLog)]),
            () => ListBuilder<AuditLog>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(Availability)]),
            () => ListBuilder<Availability>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(Booking)]),
            () => ListBuilder<Booking>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(Branch)]),
            () => ListBuilder<Branch>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(BranchAuditActivity),
            ]),
            () => ListBuilder<BranchAuditActivity>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(BranchPeriod)]),
            () => ListBuilder<BranchPeriod>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(BulkCustomerCheckInLinkItem),
            ]),
            () => ListBuilder<BulkCustomerCheckInLinkItem>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(CapabilityDefinition),
            ]),
            () => ListBuilder<CapabilityDefinition>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(ClassSlot)]),
            () => ListBuilder<ClassSlot>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(ClassType)]),
            () => ListBuilder<ClassType>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(CustomerBookingPackage),
            ]),
            () => ListBuilder<CustomerBookingPackage>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(CustomerDashboardOverviewUpcomingBookingsInner),
            ]),
            () => ListBuilder<CustomerDashboardOverviewUpcomingBookingsInner>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(CustomerDashboardOverviewPackagesInner),
            ]),
            () => ListBuilder<CustomerDashboardOverviewPackagesInner>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(CustomerDashboardOverviewActionableOrdersInner),
            ]),
            () => ListBuilder<CustomerDashboardOverviewActionableOrdersInner>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(
                CustomerDashboardOverviewVerificationDocumentsInner,
              ),
            ]),
            () =>
                ListBuilder<
                  CustomerDashboardOverviewVerificationDocumentsInner
                >(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(CustomerLookupOption),
            ]),
            () => ListBuilder<CustomerLookupOption>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(CustomerOrderTimelineItem),
            ]),
            () => ListBuilder<CustomerOrderTimelineItem>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(CustomerPackageBalance),
            ]),
            () => ListBuilder<CustomerPackageBalance>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(CustomerRescheduleTarget),
            ]),
            () => ListBuilder<CustomerRescheduleTarget>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(DashboardMetric)]),
            () => ListBuilder<DashboardMetric>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(DashboardQueueSummary),
            ]),
            () => ListBuilder<DashboardQueueSummary>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(DashboardTrendPoint),
            ]),
            () => ListBuilder<DashboardTrendPoint>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(DashboardBranchPerformance),
            ]),
            () => ListBuilder<DashboardBranchPerformance>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(DashboardRiskItem),
            ]),
            () => ListBuilder<DashboardRiskItem>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(DashboardActivityItem),
            ]),
            () => ListBuilder<DashboardActivityItem>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(OperationalJob)]),
            () => ListBuilder<OperationalJob>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(EffectiveSetting)]),
            () => ListBuilder<EffectiveSetting>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(ErrorEnvelopeErrorDetailsInner),
            ]),
            () => ListBuilder<ErrorEnvelopeErrorDetailsInner>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(FinanceAnomaly)]),
            () => ListBuilder<FinanceAnomaly>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(FinanceBranchReconciliation),
            ]),
            () => ListBuilder<FinanceBranchReconciliation>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(HealthResultDependenciesInner),
            ]),
            () => ListBuilder<HealthResultDependenciesInner>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(IdentityVerificationDocument),
            ]),
            () => ListBuilder<IdentityVerificationDocument>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(IdentityVerificationDocument),
            ]),
            () => ListBuilder<IdentityVerificationDocument>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(IdentityVerificationReviewCase),
            ]),
            () => ListBuilder<IdentityVerificationReviewCase>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(JsonObject)]),
            () => ListBuilder<JsonObject>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(LedgerEntry)]),
            () => ListBuilder<LedgerEntry>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(LookupOption)]),
            () => ListBuilder<LookupOption>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(MigrationBatchResult),
            ]),
            () => ListBuilder<MigrationBatchResult>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(NotificationOccurrence),
            ]),
            () => ListBuilder<NotificationOccurrence>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(OperationalJob)]),
            () => ListBuilder<OperationalJob>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(Order)]),
            () => ListBuilder<Order>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(OtherCost)]),
            () => ListBuilder<OtherCost>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(Package)]),
            () => ListBuilder<Package>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(PackagePromotion)]),
            () => ListBuilder<PackagePromotion>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(PackagePromotion)]),
            () => ListBuilder<PackagePromotion>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(SafeAuditActivity),
            ]),
            () => ListBuilder<SafeAuditActivity>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(Package)]),
            () => ListBuilder<Package>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(PackagePromotionOrderPageItemsInner),
            ]),
            () => ListBuilder<PackagePromotionOrderPageItemsInner>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(PaymentAccount)]),
            () => ListBuilder<PaymentAccount>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(PaymentReviewItem),
            ]),
            () => ListBuilder<PaymentReviewItem>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(PaymentUsageHistoryItem),
            ]),
            () => ListBuilder<PaymentUsageHistoryItem>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(PublicBranch)]),
            () => ListBuilder<PublicBranch>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(PublicClassMarketingSummary),
            ]),
            () => ListBuilder<PublicClassMarketingSummary>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(PublicBranch)]),
            () => ListBuilder<PublicBranch>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(PublicPackageSummary),
            ]),
            () => ListBuilder<PublicPackageSummary>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(PublicBranch)]),
            () => ListBuilder<PublicBranch>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(PublicPackageSummary),
            ]),
            () => ListBuilder<PublicPackageSummary>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(PublicScheduleSummary),
            ]),
            () => ListBuilder<PublicScheduleSummary>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(PublicBranch)]),
            () => ListBuilder<PublicBranch>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(PublicScheduleSummary),
            ]),
            () => ListBuilder<PublicScheduleSummary>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(PublicBranchProfileOpeningHoursInner),
            ]),
            () => ListBuilder<PublicBranchProfileOpeningHoursInner>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(String)]),
            () => ListBuilder<String>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(String)]),
            () => ListBuilder<String>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(PublicScheduleSummary),
            ]),
            () => ListBuilder<PublicScheduleSummary>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(PublicStudioDetailAllOfClasses),
            ]),
            () => ListBuilder<PublicStudioDetailAllOfClasses>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(PublicScheduleSummary),
            ]),
            () => ListBuilder<PublicScheduleSummary>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(PublicPackageSummary),
            ]),
            () => ListBuilder<PublicPackageSummary>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(Purchase)]),
            () => ListBuilder<Purchase>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(Reschedule)]),
            () => ListBuilder<Reschedule>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(Resource)]),
            () => ListBuilder<Resource>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(Role)]),
            () => ListBuilder<Role>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(String)]),
            () => ListBuilder<String>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(Role)]),
            () => ListBuilder<Role>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(String)]),
            () => ListBuilder<String>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(String)]),
            () => ListBuilder<String>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(String)]),
            () => ListBuilder<String>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(String)]),
            () => ListBuilder<String>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(SessionBranch)]),
            () => ListBuilder<SessionBranch>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(RoleCatalogItem)]),
            () => ListBuilder<RoleCatalogItem>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(SessionAdjustment),
            ]),
            () => ListBuilder<SessionAdjustment>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(String)]),
            () => ListBuilder<String>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(String)]),
            () => ListBuilder<String>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(String)]),
            () => ListBuilder<String>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(String)]),
            () => ListBuilder<String>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(String)]),
            () => ListBuilder<String>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(String)]),
            () => ListBuilder<String>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(String)]),
            () => ListBuilder<String>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(String)]),
            () => ListBuilder<String>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(String)]),
            () => ListBuilder<String>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(String)]),
            () => ListBuilder<String>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(String)]),
            () => ListBuilder<String>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(String)]),
            () => ListBuilder<String>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(String)]),
            () => ListBuilder<String>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(String)]),
            () => ListBuilder<String>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(EffectiveCapabilityGrant),
            ]),
            () => ListBuilder<EffectiveCapabilityGrant>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(EffectiveCapabilityDenial),
            ]),
            () => ListBuilder<EffectiveCapabilityDenial>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(String)]),
            () => ListBuilder<String>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(String)]),
            () => ListBuilder<String>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(String)]),
            () => ListBuilder<String>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(String)]),
            () => ListBuilder<String>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(String)]),
            () => ListBuilder<String>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(VoucherPackagesInner),
            ]),
            () => ListBuilder<VoucherPackagesInner>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(SafeAuditActivity),
            ]),
            () => ListBuilder<SafeAuditActivity>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(UserAccessRoleAssignment),
            ]),
            () => ListBuilder<UserAccessRoleAssignment>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(UserPermissionOverride),
            ]),
            () => ListBuilder<UserPermissionOverride>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(UserNotification)]),
            () => ListBuilder<UserNotification>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(UserRoleInput)]),
            () => ListBuilder<UserRoleInput>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(UserRoleInput)]),
            () => ListBuilder<UserRoleInput>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(Role)]),
            () => ListBuilder<Role>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(String)]),
            () => ListBuilder<String>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(UserRoleSummary)]),
            () => ListBuilder<UserRoleSummary>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(UserRoleSummary)]),
            () => ListBuilder<UserRoleSummary>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(UserRoleSummary)]),
            () => ListBuilder<UserRoleSummary>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(String)]),
            () => ListBuilder<String>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(UserSummary)]),
            () => ListBuilder<UserSummary>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(UserVerificationDocumentSummary),
            ]),
            () => ListBuilder<UserVerificationDocumentSummary>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(Voucher)]),
            () => ListBuilder<Voucher>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(VoucherRedemption),
            ]),
            () => ListBuilder<VoucherRedemption>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltMap, const [
              const FullType(String),
              const FullType(Money),
            ]),
            () => MapBuilder<String, Money>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltMap, const [
              const FullType(String),
              const FullType(int),
            ]),
            () => MapBuilder<String, int>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltSet, const [
              const FullType(AccessRoleAssignmentInput),
            ]),
            () => SetBuilder<AccessRoleAssignmentInput>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltSet, const [const FullType(String)]),
            () => SetBuilder<String>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltSet, const [const FullType(String)]),
            () => SetBuilder<String>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltSet, const [const FullType(String)]),
            () => SetBuilder<String>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltSet, const [const FullType(String)]),
            () => SetBuilder<String>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltSet, const [const FullType(String)]),
            () => SetBuilder<String>(),
          ))
        .build();

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
