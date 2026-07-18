// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'replace_payment_proof_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ReplacePaymentProofCommand extends ReplacePaymentProofCommand {
  @override
  final String newPaymentProofUploadId;
  @override
  final String reason;

  factory _$ReplacePaymentProofCommand([
    void Function(ReplacePaymentProofCommandBuilder)? updates,
  ]) => (ReplacePaymentProofCommandBuilder()..update(updates))._build();

  _$ReplacePaymentProofCommand._({
    required this.newPaymentProofUploadId,
    required this.reason,
  }) : super._();
  @override
  ReplacePaymentProofCommand rebuild(
    void Function(ReplacePaymentProofCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  ReplacePaymentProofCommandBuilder toBuilder() =>
      ReplacePaymentProofCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ReplacePaymentProofCommand &&
        newPaymentProofUploadId == other.newPaymentProofUploadId &&
        reason == other.reason;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, newPaymentProofUploadId.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ReplacePaymentProofCommand')
          ..add('newPaymentProofUploadId', newPaymentProofUploadId)
          ..add('reason', reason))
        .toString();
  }
}

class ReplacePaymentProofCommandBuilder
    implements
        Builder<ReplacePaymentProofCommand, ReplacePaymentProofCommandBuilder> {
  _$ReplacePaymentProofCommand? _$v;

  String? _newPaymentProofUploadId;
  String? get newPaymentProofUploadId => _$this._newPaymentProofUploadId;
  set newPaymentProofUploadId(String? newPaymentProofUploadId) =>
      _$this._newPaymentProofUploadId = newPaymentProofUploadId;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  ReplacePaymentProofCommandBuilder() {
    ReplacePaymentProofCommand._defaults(this);
  }

  ReplacePaymentProofCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _newPaymentProofUploadId = $v.newPaymentProofUploadId;
      _reason = $v.reason;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ReplacePaymentProofCommand other) {
    _$v = other as _$ReplacePaymentProofCommand;
  }

  @override
  void update(void Function(ReplacePaymentProofCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ReplacePaymentProofCommand build() => _build();

  _$ReplacePaymentProofCommand _build() {
    final _$result =
        _$v ??
        _$ReplacePaymentProofCommand._(
          newPaymentProofUploadId: BuiltValueNullFieldError.checkNotNull(
            newPaymentProofUploadId,
            r'ReplacePaymentProofCommand',
            'newPaymentProofUploadId',
          ),
          reason: BuiltValueNullFieldError.checkNotNull(
            reason,
            r'ReplacePaymentProofCommand',
            'reason',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
