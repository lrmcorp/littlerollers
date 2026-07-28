// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'identity_verification_review_summary.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$IdentityVerificationReviewSummary
    extends IdentityVerificationReviewSummary {
  @override
  final int totalCustomers;
  @override
  final int totalDocuments;
  @override
  final int pendingDocuments;
  @override
  final int approvedDocuments;
  @override
  final int rejectedDocuments;
  @override
  final int deletionIssues;

  factory _$IdentityVerificationReviewSummary([
    void Function(IdentityVerificationReviewSummaryBuilder)? updates,
  ]) => (IdentityVerificationReviewSummaryBuilder()..update(updates))._build();

  _$IdentityVerificationReviewSummary._({
    required this.totalCustomers,
    required this.totalDocuments,
    required this.pendingDocuments,
    required this.approvedDocuments,
    required this.rejectedDocuments,
    required this.deletionIssues,
  }) : super._();
  @override
  IdentityVerificationReviewSummary rebuild(
    void Function(IdentityVerificationReviewSummaryBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  IdentityVerificationReviewSummaryBuilder toBuilder() =>
      IdentityVerificationReviewSummaryBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is IdentityVerificationReviewSummary &&
        totalCustomers == other.totalCustomers &&
        totalDocuments == other.totalDocuments &&
        pendingDocuments == other.pendingDocuments &&
        approvedDocuments == other.approvedDocuments &&
        rejectedDocuments == other.rejectedDocuments &&
        deletionIssues == other.deletionIssues;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, totalCustomers.hashCode);
    _$hash = $jc(_$hash, totalDocuments.hashCode);
    _$hash = $jc(_$hash, pendingDocuments.hashCode);
    _$hash = $jc(_$hash, approvedDocuments.hashCode);
    _$hash = $jc(_$hash, rejectedDocuments.hashCode);
    _$hash = $jc(_$hash, deletionIssues.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'IdentityVerificationReviewSummary')
          ..add('totalCustomers', totalCustomers)
          ..add('totalDocuments', totalDocuments)
          ..add('pendingDocuments', pendingDocuments)
          ..add('approvedDocuments', approvedDocuments)
          ..add('rejectedDocuments', rejectedDocuments)
          ..add('deletionIssues', deletionIssues))
        .toString();
  }
}

class IdentityVerificationReviewSummaryBuilder
    implements
        Builder<
          IdentityVerificationReviewSummary,
          IdentityVerificationReviewSummaryBuilder
        > {
  _$IdentityVerificationReviewSummary? _$v;

  int? _totalCustomers;
  int? get totalCustomers => _$this._totalCustomers;
  set totalCustomers(int? totalCustomers) =>
      _$this._totalCustomers = totalCustomers;

  int? _totalDocuments;
  int? get totalDocuments => _$this._totalDocuments;
  set totalDocuments(int? totalDocuments) =>
      _$this._totalDocuments = totalDocuments;

  int? _pendingDocuments;
  int? get pendingDocuments => _$this._pendingDocuments;
  set pendingDocuments(int? pendingDocuments) =>
      _$this._pendingDocuments = pendingDocuments;

  int? _approvedDocuments;
  int? get approvedDocuments => _$this._approvedDocuments;
  set approvedDocuments(int? approvedDocuments) =>
      _$this._approvedDocuments = approvedDocuments;

  int? _rejectedDocuments;
  int? get rejectedDocuments => _$this._rejectedDocuments;
  set rejectedDocuments(int? rejectedDocuments) =>
      _$this._rejectedDocuments = rejectedDocuments;

  int? _deletionIssues;
  int? get deletionIssues => _$this._deletionIssues;
  set deletionIssues(int? deletionIssues) =>
      _$this._deletionIssues = deletionIssues;

  IdentityVerificationReviewSummaryBuilder() {
    IdentityVerificationReviewSummary._defaults(this);
  }

  IdentityVerificationReviewSummaryBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _totalCustomers = $v.totalCustomers;
      _totalDocuments = $v.totalDocuments;
      _pendingDocuments = $v.pendingDocuments;
      _approvedDocuments = $v.approvedDocuments;
      _rejectedDocuments = $v.rejectedDocuments;
      _deletionIssues = $v.deletionIssues;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(IdentityVerificationReviewSummary other) {
    _$v = other as _$IdentityVerificationReviewSummary;
  }

  @override
  void update(
    void Function(IdentityVerificationReviewSummaryBuilder)? updates,
  ) {
    if (updates != null) updates(this);
  }

  @override
  IdentityVerificationReviewSummary build() => _build();

  _$IdentityVerificationReviewSummary _build() {
    final _$result =
        _$v ??
        _$IdentityVerificationReviewSummary._(
          totalCustomers: BuiltValueNullFieldError.checkNotNull(
            totalCustomers,
            r'IdentityVerificationReviewSummary',
            'totalCustomers',
          ),
          totalDocuments: BuiltValueNullFieldError.checkNotNull(
            totalDocuments,
            r'IdentityVerificationReviewSummary',
            'totalDocuments',
          ),
          pendingDocuments: BuiltValueNullFieldError.checkNotNull(
            pendingDocuments,
            r'IdentityVerificationReviewSummary',
            'pendingDocuments',
          ),
          approvedDocuments: BuiltValueNullFieldError.checkNotNull(
            approvedDocuments,
            r'IdentityVerificationReviewSummary',
            'approvedDocuments',
          ),
          rejectedDocuments: BuiltValueNullFieldError.checkNotNull(
            rejectedDocuments,
            r'IdentityVerificationReviewSummary',
            'rejectedDocuments',
          ),
          deletionIssues: BuiltValueNullFieldError.checkNotNull(
            deletionIssues,
            r'IdentityVerificationReviewSummary',
            'deletionIssues',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
