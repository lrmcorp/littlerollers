// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'attach_order_proof_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AttachOrderProofCommand extends AttachOrderProofCommand {
  @override
  final String paymentProofId;
  @override
  final int expectedVersion;

  factory _$AttachOrderProofCommand([
    void Function(AttachOrderProofCommandBuilder)? updates,
  ]) => (AttachOrderProofCommandBuilder()..update(updates))._build();

  _$AttachOrderProofCommand._({
    required this.paymentProofId,
    required this.expectedVersion,
  }) : super._();
  @override
  AttachOrderProofCommand rebuild(
    void Function(AttachOrderProofCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  AttachOrderProofCommandBuilder toBuilder() =>
      AttachOrderProofCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AttachOrderProofCommand &&
        paymentProofId == other.paymentProofId &&
        expectedVersion == other.expectedVersion;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, paymentProofId.hashCode);
    _$hash = $jc(_$hash, expectedVersion.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AttachOrderProofCommand')
          ..add('paymentProofId', paymentProofId)
          ..add('expectedVersion', expectedVersion))
        .toString();
  }
}

class AttachOrderProofCommandBuilder
    implements
        Builder<AttachOrderProofCommand, AttachOrderProofCommandBuilder> {
  _$AttachOrderProofCommand? _$v;

  String? _paymentProofId;
  String? get paymentProofId => _$this._paymentProofId;
  set paymentProofId(String? paymentProofId) =>
      _$this._paymentProofId = paymentProofId;

  int? _expectedVersion;
  int? get expectedVersion => _$this._expectedVersion;
  set expectedVersion(int? expectedVersion) =>
      _$this._expectedVersion = expectedVersion;

  AttachOrderProofCommandBuilder() {
    AttachOrderProofCommand._defaults(this);
  }

  AttachOrderProofCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _paymentProofId = $v.paymentProofId;
      _expectedVersion = $v.expectedVersion;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AttachOrderProofCommand other) {
    _$v = other as _$AttachOrderProofCommand;
  }

  @override
  void update(void Function(AttachOrderProofCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AttachOrderProofCommand build() => _build();

  _$AttachOrderProofCommand _build() {
    final _$result =
        _$v ??
        _$AttachOrderProofCommand._(
          paymentProofId: BuiltValueNullFieldError.checkNotNull(
            paymentProofId,
            r'AttachOrderProofCommand',
            'paymentProofId',
          ),
          expectedVersion: BuiltValueNullFieldError.checkNotNull(
            expectedVersion,
            r'AttachOrderProofCommand',
            'expectedVersion',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
