// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'serializers.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

Serializers _$serializers =
    (Serializers().toBuilder()
          ..add($EffectivePeriod.serializer)
          ..add($PrivateImageMetadata.serializer)
          ..add(AcceptedStatus.serializer)
          ..add(AccountLinkCommand.serializer)
          ..add(AccountLinkCommandProviderEnum.serializer)
          ..add(ActionCommand.serializer)
          ..add(AdjustmentCommand.serializer)
          ..add(AdjustmentCommandReasonCodeEnum.serializer)
          ..add(AdjustmentDecisionResult.serializer)
          ..add(ApprovalResult.serializer)
          ..add(ApprovePurchaseRequest.serializer)
          ..add(ApprovePurchaseRequestReasonCodeEnum.serializer)
          ..add(AssignInstructorCommand.serializer)
          ..add(Assignment.serializer)
          ..add(AssignmentAssignmentTypeEnum.serializer)
          ..add(AssignmentCommand.serializer)
          ..add(AssignmentCommandAssignmentTypeEnum.serializer)
          ..add(AssignmentPage.serializer)
          ..add(AttachOrderProofCommand.serializer)
          ..add(AuditExport.serializer)
          ..add(AuditExportCommand.serializer)
          ..add(AuditExportCommandFormatEnum.serializer)
          ..add(AuditExportStatusEnum.serializer)
          ..add(AuditLog.serializer)
          ..add(AuditLogActorTypeEnum.serializer)
          ..add(AuditLogPage.serializer)
          ..add(AuthSecurityStatus.serializer)
          ..add(AuthorizeIdentityVerificationView200Response.serializer)
          ..add(Availability.serializer)
          ..add(AvailabilityPage.serializer)
          ..add(AvailabilityStatusEnum.serializer)
          ..add(BackfillCustomerCheckInRequest.serializer)
          ..add(Booking.serializer)
          ..add(BookingCommand.serializer)
          ..add(BookingCommandSource_Enum.serializer)
          ..add(BookingPage.serializer)
          ..add(BookingReservedQuantityEnum.serializer)
          ..add(BookingSource_Enum.serializer)
          ..add(BookingStatusEnum.serializer)
          ..add(Branch.serializer)
          ..add(BranchCommand.serializer)
          ..add(BranchPage.serializer)
          ..add(BranchPeriod.serializer)
          ..add(BranchPeriodPage.serializer)
          ..add(BranchPeriodStatusEnum.serializer)
          ..add(ChallengeAccepted.serializer)
          ..add(ChallengeExpiry.serializer)
          ..add(ChangedStatus.serializer)
          ..add(CheckInResult.serializer)
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
          ..add(ClassSlotVersionCommand.serializer)
          ..add(ClassType.serializer)
          ..add(ClassTypeCommand.serializer)
          ..add(ClassTypePage.serializer)
          ..add(CloseMonthRequest.serializer)
          ..add(CloseResult.serializer)
          ..add(CompleteClassCommand.serializer)
          ..add(CompletionResult.serializer)
          ..add(Correction.serializer)
          ..add(CorrectionCommand.serializer)
          ..add(CorrectionDecisionResult.serializer)
          ..add(CorrectionStatusEnum.serializer)
          ..add(CreateOrderCommand.serializer)
          ..add(CreatePaymentProofUploadRequest.serializer)
          ..add(CursorPageMeta.serializer)
          ..add(CustomerBookingOptions.serializer)
          ..add(CustomerBookingPackage.serializer)
          ..add(CustomerBookingSlot.serializer)
          ..add(CustomerBookingSlotBranch.serializer)
          ..add(CustomerBookingSlotClassType.serializer)
          ..add(CustomerBookingSlotStatusEnum.serializer)
          ..add(CustomerPackageBalance.serializer)
          ..add(CustomerPackageBalancePage.serializer)
          ..add(CustomerPackageBalanceStatusEnum.serializer)
          ..add(CustomerRegistrationCommand.serializer)
          ..add(CustomerRegistrationCommandConsentEnum.serializer)
          ..add(DeactivateUserRequest.serializer)
          ..add(DeleteIdentityVerificationFileRequest.serializer)
          ..add(DownloadAuthorization.serializer)
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
          ..add(FinancialReport.serializer)
          ..add(FinancialReportPage.serializer)
          ..add(FinancialReportReportTypeEnum.serializer)
          ..add(GoogleAuthRequest.serializer)
          ..add(GoogleAuthRequestChannelEnum.serializer)
          ..add(HealthResult.serializer)
          ..add(HealthResultDependenciesInner.serializer)
          ..add(HealthResultDependenciesInnerStatusEnum.serializer)
          ..add(HealthResultStatusEnum.serializer)
          ..add(IdentityVerificationDecisionCommand.serializer)
          ..add(IdentityVerificationDecisionCommandReasonCodeEnum.serializer)
          ..add(IdentityVerificationDocument.serializer)
          ..add(IdentityVerificationDocumentKindEnum.serializer)
          ..add(IdentityVerificationDocumentScanStatusEnum.serializer)
          ..add(IdentityVerificationDocumentStatusEnum.serializer)
          ..add(IdentityVerificationDocumentUploadStatusEnum.serializer)
          ..add(IdentityVerificationSummary.serializer)
          ..add(IdentityVerificationSummaryStatusEnum.serializer)
          ..add(InstructorFeeCommand.serializer)
          ..add(InviteUserRequest.serializer)
          ..add(LedgerEntry.serializer)
          ..add(LedgerEntryTypeEnum.serializer)
          ..add(ListIdentityVerifications200Response.serializer)
          ..add(ListPaymentAccounts200Response.serializer)
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
          ..add(Money.serializer)
          ..add(NotificationAttempt.serializer)
          ..add(NotificationAttemptStatusEnum.serializer)
          ..add(NotificationOccurrence.serializer)
          ..add(NotificationOccurrenceChannelEnum.serializer)
          ..add(NotificationOccurrencePage.serializer)
          ..add(NotificationOccurrenceStatusEnum.serializer)
          ..add(OperationalJob.serializer)
          ..add(OperationalJobPage.serializer)
          ..add(OperationalJobResult.serializer)
          ..add(OperationalJobResultStatusEnum.serializer)
          ..add(OperationalJobStatusEnum.serializer)
          ..add(Order.serializer)
          ..add(OrderPage.serializer)
          ..add(OrderPaymentAccount.serializer)
          ..add(OrderStatusEnum.serializer)
          ..add(OtherCost.serializer)
          ..add(OtherCostCommand.serializer)
          ..add(OtherCostPage.serializer)
          ..add(OtherCostStatusEnum.serializer)
          ..add(OtpRequest.serializer)
          ..add(OtpVerifyRequest.serializer)
          ..add(Package.serializer)
          ..add(PackageCommand.serializer)
          ..add(PackageLedgerResult.serializer)
          ..add(PackagePage.serializer)
          ..add(PackageStatusEnum.serializer)
          ..add(Page.serializer)
          ..add(PagePage.serializer)
          ..add(PasswordChangeCommand.serializer)
          ..add(PasswordResetRequest.serializer)
          ..add(PasswordSessionRequest.serializer)
          ..add(PasswordSessionRequestChannelEnum.serializer)
          ..add(PasswordSetupRequest.serializer)
          ..add(PasswordTokenCommand.serializer)
          ..add(PaymentAccount.serializer)
          ..add(PaymentAccountCommand.serializer)
          ..add(PaymentProof.serializer)
          ..add(PaymentProofScanStatusEnum.serializer)
          ..add(PaymentProofUploadInstruction.serializer)
          ..add(PaymentProofUploadStatusEnum.serializer)
          ..add(PrivateImageMetadataMimeTypeEnum.serializer)
          ..add(ProjectionRateCommand.serializer)
          ..add(Purchase.serializer)
          ..add(PurchasePage.serializer)
          ..add(PurchaseStatusEnum.serializer)
          ..add(QuotaCapacityCommand.serializer)
          ..add(QuotaEvaluationCommand.serializer)
          ..add(QuotaEvaluationResult.serializer)
          ..add(QuotaEvaluationResultStatusEnum.serializer)
          ..add(ReasonedVersionCommand.serializer)
          ..add(RecoveryRequestCommand.serializer)
          ..add(RecoveryRequestCommandRequestedChannelEnum.serializer)
          ..add(RecoveryVerifyCommand.serializer)
          ..add(RecoveryVerifyCommandNewVerifiedIdentity.serializer)
          ..add(ReplaceMyIdentityDocumentRequest.serializer)
          ..add(ReplacePaymentProofCommand.serializer)
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
          ..add(RevokeSessionsCommand.serializer)
          ..add(Role.serializer)
          ..add(RoleCatalog.serializer)
          ..add(RoleCatalogItem.serializer)
          ..add(RoleCatalogItemScopeEnum.serializer)
          ..add(Session.serializer)
          ..add(SessionAdjustment.serializer)
          ..add(SessionAdjustmentDecisionCodeEnum.serializer)
          ..add(SessionAdjustmentDecisionCommand.serializer)
          ..add(SessionAdjustmentDecisionCommandReasonCodeEnum.serializer)
          ..add(SessionAdjustmentPage.serializer)
          ..add(SessionAdjustmentReasonCodeEnum.serializer)
          ..add(SessionAdjustmentStatusEnum.serializer)
          ..add(SessionBranch.serializer)
          ..add(SessionChannelEnum.serializer)
          ..add(SubmitPurchaseRequest.serializer)
          ..add(TimeRangeCommand.serializer)
          ..add(TokenCheckInCommand.serializer)
          ..add(UpdateUserRolesCommand.serializer)
          ..add(UserPage.serializer)
          ..add(UserRoleInput.serializer)
          ..add(UserRoleSummary.serializer)
          ..add(UserRoleSummaryBranch.serializer)
          ..add(UserRoleSummarySource_Enum.serializer)
          ..add(UserSummary.serializer)
          ..add(UserSummaryStatusEnum.serializer)
          ..add(VersionCommand.serializer)
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
            const FullType(BuiltList, const [const FullType(BranchPeriod)]),
            () => ListBuilder<BranchPeriod>(),
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
              const FullType(CustomerPackageBalance),
            ]),
            () => ListBuilder<CustomerPackageBalance>(),
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
            const FullType(BuiltList, const [const FullType(JsonObject)]),
            () => ListBuilder<JsonObject>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(LedgerEntry)]),
            () => ListBuilder<LedgerEntry>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(MigrationBatchResult),
            ]),
            () => ListBuilder<MigrationBatchResult>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(NotificationAttempt),
            ]),
            () => ListBuilder<NotificationAttempt>(),
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
            const FullType(BuiltList, const [const FullType(PaymentAccount)]),
            () => ListBuilder<PaymentAccount>(),
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
            const FullType(BuiltMap, const [
              const FullType(String),
              const FullType(Money),
            ]),
            () => MapBuilder<String, Money>(),
          ))
        .build();

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
