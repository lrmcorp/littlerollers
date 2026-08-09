// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'decide_internal_v1_migration_resolution_request.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$DecideInternalV1MigrationResolutionRequest
    extends DecideInternalV1MigrationResolutionRequest {
  @override
  final bool approve;
  @override
  final String reason;
  @override
  final JsonObject? decision;

  factory _$DecideInternalV1MigrationResolutionRequest([
    void Function(DecideInternalV1MigrationResolutionRequestBuilder)? updates,
  ]) => (DecideInternalV1MigrationResolutionRequestBuilder()..update(updates))
      ._build();

  _$DecideInternalV1MigrationResolutionRequest._({
    required this.approve,
    required this.reason,
    this.decision,
  }) : super._();
  @override
  DecideInternalV1MigrationResolutionRequest rebuild(
    void Function(DecideInternalV1MigrationResolutionRequestBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  DecideInternalV1MigrationResolutionRequestBuilder toBuilder() =>
      DecideInternalV1MigrationResolutionRequestBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is DecideInternalV1MigrationResolutionRequest &&
        approve == other.approve &&
        reason == other.reason &&
        decision == other.decision;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, approve.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jc(_$hash, decision.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(
            r'DecideInternalV1MigrationResolutionRequest',
          )
          ..add('approve', approve)
          ..add('reason', reason)
          ..add('decision', decision))
        .toString();
  }
}

class DecideInternalV1MigrationResolutionRequestBuilder
    implements
        Builder<
          DecideInternalV1MigrationResolutionRequest,
          DecideInternalV1MigrationResolutionRequestBuilder
        > {
  _$DecideInternalV1MigrationResolutionRequest? _$v;

  bool? _approve;
  bool? get approve => _$this._approve;
  set approve(bool? approve) => _$this._approve = approve;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  JsonObject? _decision;
  JsonObject? get decision => _$this._decision;
  set decision(JsonObject? decision) => _$this._decision = decision;

  DecideInternalV1MigrationResolutionRequestBuilder() {
    DecideInternalV1MigrationResolutionRequest._defaults(this);
  }

  DecideInternalV1MigrationResolutionRequestBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _approve = $v.approve;
      _reason = $v.reason;
      _decision = $v.decision;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(DecideInternalV1MigrationResolutionRequest other) {
    _$v = other as _$DecideInternalV1MigrationResolutionRequest;
  }

  @override
  void update(
    void Function(DecideInternalV1MigrationResolutionRequestBuilder)? updates,
  ) {
    if (updates != null) updates(this);
  }

  @override
  DecideInternalV1MigrationResolutionRequest build() => _build();

  _$DecideInternalV1MigrationResolutionRequest _build() {
    final _$result =
        _$v ??
        _$DecideInternalV1MigrationResolutionRequest._(
          approve: BuiltValueNullFieldError.checkNotNull(
            approve,
            r'DecideInternalV1MigrationResolutionRequest',
            'approve',
          ),
          reason: BuiltValueNullFieldError.checkNotNull(
            reason,
            r'DecideInternalV1MigrationResolutionRequest',
            'reason',
          ),
          decision: decision,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
