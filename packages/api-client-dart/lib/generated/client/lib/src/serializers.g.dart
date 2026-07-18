// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'serializers.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

Serializers _$serializers =
    (Serializers().toBuilder()
          ..add($EffectivePeriod.serializer)
          ..add(AccountLinkCommand.serializer)
          ..add(AccountLinkCommandProviderEnum.serializer)
          ..add(ActionCommand.serializer)
          ..add(AdjustmentCommand.serializer)
          ..add(AdjustmentDecisionResult.serializer)
          ..add(ApprovalResult.serializer)
          ..add(AssignInstructorCommand.serializer)
          ..add(Assignment.serializer)
          ..add(AssignmentAssignmentTypeEnum.serializer)
          ..add(AssignmentCommand.serializer)
          ..add(AssignmentCommandAssignmentTypeEnum.serializer)
          ..add(AssignmentPage.serializer)
          ..add(AuditExport.serializer)
          ..add(AuditExportCommand.serializer)
          ..add(AuditExportCommandFormatEnum.serializer)
          ..add(AuditExportStatusEnum.serializer)
          ..add(AuditLog.serializer)
          ..add(AuditLogActorTypeEnum.serializer)
          ..add(AuditLogPage.serializer)
          ..add(Availability.serializer)
          ..add(AvailabilityPage.serializer)
          ..add(AvailabilityStatusEnum.serializer)
          ..add(BackfillCustomerCheckInRequest.serializer)
          ..add(Booking.serializer)
          ..add(BookingCommand.serializer)
          ..add(BookingCommandSource_Enum.serializer)
          ..add(BookingPage.serializer)
          ..add(BookingStatusEnum.serializer)
          ..add(BranchCommand.serializer)
          ..add(BranchPeriod.serializer)
          ..add(BranchPeriodPage.serializer)
          ..add(BranchPeriodStatusEnum.serializer)
          ..add(ChallengeAccepted.serializer)
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
          ..add(ClassSlot.serializer)
          ..add(ClassSlotCommand.serializer)
          ..add(ClassSlotPage.serializer)
          ..add(ClassSlotStatusEnum.serializer)
          ..add(CloseMonthRequest.serializer)
          ..add(CloseResult.serializer)
          ..add(CompleteClassCommand.serializer)
          ..add(CompletionResult.serializer)
          ..add(Correction.serializer)
          ..add(CorrectionCommand.serializer)
          ..add(CorrectionDecisionResult.serializer)
          ..add(CorrectionStatusEnum.serializer)
          ..add(CreatePaymentProofUploadRequest.serializer)
          ..add(CursorPageMeta.serializer)
          ..add(CustomerPackageBalance.serializer)
          ..add(CustomerPackageBalancePage.serializer)
          ..add(CustomerPackageBalanceStatusEnum.serializer)
          ..add(DeactivateUserRequest.serializer)
          ..add(DownloadAuthorization.serializer)
          ..add(EffectiveSettingCommand.serializer)
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
          ..add(InstructorFeeCommand.serializer)
          ..add(InviteUserRequest.serializer)
          ..add(LedgerEntry.serializer)
          ..add(LedgerEntryTypeEnum.serializer)
          ..add(Me.serializer)
          ..add(MfaChallenge.serializer)
          ..add(MfaChallengeCommand.serializer)
          ..add(MfaChallengeCommandPurposeEnum.serializer)
          ..add(MfaVerifyCommand.serializer)
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
          ..add(OtherCost.serializer)
          ..add(OtherCostCommand.serializer)
          ..add(OtherCostPage.serializer)
          ..add(OtherCostStatusEnum.serializer)
          ..add(OtpRequest.serializer)
          ..add(OtpVerifyRequest.serializer)
          ..add(Package.serializer)
          ..add(PackageCommand.serializer)
          ..add(PackageLedgerResult.serializer)
          ..add(PackageStatusEnum.serializer)
          ..add(Page.serializer)
          ..add(PagePage.serializer)
          ..add(PaymentProof.serializer)
          ..add(PaymentProofScanStatusEnum.serializer)
          ..add(PaymentProofUploadStatusEnum.serializer)
          ..add(ProjectionRateCommand.serializer)
          ..add(Purchase.serializer)
          ..add(PurchaseStatusEnum.serializer)
          ..add(QuotaCapacityCommand.serializer)
          ..add(QuotaEvaluationCommand.serializer)
          ..add(QuotaEvaluationResult.serializer)
          ..add(QuotaEvaluationResultStatusEnum.serializer)
          ..add(RecoveryRequestCommand.serializer)
          ..add(RecoveryRequestCommandRequestedChannelEnum.serializer)
          ..add(RecoveryVerifyCommand.serializer)
          ..add(RecoveryVerifyCommandNewVerifiedIdentity.serializer)
          ..add(ReplacePaymentProofCommand.serializer)
          ..add(Reschedule.serializer)
          ..add(RescheduleCommand.serializer)
          ..add(RescheduleDecisionResult.serializer)
          ..add(RescheduleStatusEnum.serializer)
          ..add(Resource.serializer)
          ..add(RevokeSessionsCommand.serializer)
          ..add(Role.serializer)
          ..add(Session.serializer)
          ..add(SessionAdjustment.serializer)
          ..add(SessionAdjustmentStatusEnum.serializer)
          ..add(SessionAssuranceEnum.serializer)
          ..add(SessionChannelEnum.serializer)
          ..add(SubmitPurchaseRequest.serializer)
          ..add(TimeRangeCommand.serializer)
          ..add(TokenCheckInCommand.serializer)
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
            const FullType(BuiltList, const [const FullType(BranchPeriod)]),
            () => ListBuilder<BranchPeriod>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [const FullType(ClassSlot)]),
            () => ListBuilder<ClassSlot>(),
          )
          ..addBuilderFactory(
            const FullType(BuiltList, const [
              const FullType(CustomerPackageBalance),
            ]),
            () => ListBuilder<CustomerPackageBalance>(),
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
            const FullType(BuiltList, const [const FullType(OtherCost)]),
            () => ListBuilder<OtherCost>(),
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
            const FullType(BuiltMap, const [
              const FullType(String),
              const FullType(Money),
            ]),
            () => MapBuilder<String, Money>(),
          ))
        .build();

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
