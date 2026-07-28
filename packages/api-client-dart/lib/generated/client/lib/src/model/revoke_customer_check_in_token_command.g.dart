// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'revoke_customer_check_in_token_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$RevokeCustomerCheckInTokenCommand
    extends RevokeCustomerCheckInTokenCommand {
  @override
  final int expectedVersion;
  @override
  final String reason;

  factory _$RevokeCustomerCheckInTokenCommand([
    void Function(RevokeCustomerCheckInTokenCommandBuilder)? updates,
  ]) => (RevokeCustomerCheckInTokenCommandBuilder()..update(updates))._build();

  _$RevokeCustomerCheckInTokenCommand._({
    required this.expectedVersion,
    required this.reason,
  }) : super._();
  @override
  RevokeCustomerCheckInTokenCommand rebuild(
    void Function(RevokeCustomerCheckInTokenCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  RevokeCustomerCheckInTokenCommandBuilder toBuilder() =>
      RevokeCustomerCheckInTokenCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is RevokeCustomerCheckInTokenCommand &&
        expectedVersion == other.expectedVersion &&
        reason == other.reason;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, expectedVersion.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'RevokeCustomerCheckInTokenCommand')
          ..add('expectedVersion', expectedVersion)
          ..add('reason', reason))
        .toString();
  }
}

class RevokeCustomerCheckInTokenCommandBuilder
    implements
        Builder<
          RevokeCustomerCheckInTokenCommand,
          RevokeCustomerCheckInTokenCommandBuilder
        > {
  _$RevokeCustomerCheckInTokenCommand? _$v;

  int? _expectedVersion;
  int? get expectedVersion => _$this._expectedVersion;
  set expectedVersion(int? expectedVersion) =>
      _$this._expectedVersion = expectedVersion;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  RevokeCustomerCheckInTokenCommandBuilder() {
    RevokeCustomerCheckInTokenCommand._defaults(this);
  }

  RevokeCustomerCheckInTokenCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _expectedVersion = $v.expectedVersion;
      _reason = $v.reason;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(RevokeCustomerCheckInTokenCommand other) {
    _$v = other as _$RevokeCustomerCheckInTokenCommand;
  }

  @override
  void update(
    void Function(RevokeCustomerCheckInTokenCommandBuilder)? updates,
  ) {
    if (updates != null) updates(this);
  }

  @override
  RevokeCustomerCheckInTokenCommand build() => _build();

  _$RevokeCustomerCheckInTokenCommand _build() {
    final _$result =
        _$v ??
        _$RevokeCustomerCheckInTokenCommand._(
          expectedVersion: BuiltValueNullFieldError.checkNotNull(
            expectedVersion,
            r'RevokeCustomerCheckInTokenCommand',
            'expectedVersion',
          ),
          reason: BuiltValueNullFieldError.checkNotNull(
            reason,
            r'RevokeCustomerCheckInTokenCommand',
            'reason',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
