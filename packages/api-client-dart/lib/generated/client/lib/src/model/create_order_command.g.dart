// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'create_order_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CreateOrderCommand extends CreateOrderCommand {
  @override
  final String packageId;
  @override
  final String? branchId;
  @override
  final String? slotId;
  @override
  final String? voucherCode;
  @override
  final int? expectedPackageVersion;
  @override
  final String? expectedPromotionId;
  @override
  final int? expectedPromotionVersion;

  factory _$CreateOrderCommand([
    void Function(CreateOrderCommandBuilder)? updates,
  ]) => (CreateOrderCommandBuilder()..update(updates))._build();

  _$CreateOrderCommand._({
    required this.packageId,
    this.branchId,
    this.slotId,
    this.voucherCode,
    this.expectedPackageVersion,
    this.expectedPromotionId,
    this.expectedPromotionVersion,
  }) : super._();
  @override
  CreateOrderCommand rebuild(
    void Function(CreateOrderCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CreateOrderCommandBuilder toBuilder() =>
      CreateOrderCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CreateOrderCommand &&
        packageId == other.packageId &&
        branchId == other.branchId &&
        slotId == other.slotId &&
        voucherCode == other.voucherCode &&
        expectedPackageVersion == other.expectedPackageVersion &&
        expectedPromotionId == other.expectedPromotionId &&
        expectedPromotionVersion == other.expectedPromotionVersion;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, packageId.hashCode);
    _$hash = $jc(_$hash, branchId.hashCode);
    _$hash = $jc(_$hash, slotId.hashCode);
    _$hash = $jc(_$hash, voucherCode.hashCode);
    _$hash = $jc(_$hash, expectedPackageVersion.hashCode);
    _$hash = $jc(_$hash, expectedPromotionId.hashCode);
    _$hash = $jc(_$hash, expectedPromotionVersion.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CreateOrderCommand')
          ..add('packageId', packageId)
          ..add('branchId', branchId)
          ..add('slotId', slotId)
          ..add('voucherCode', voucherCode)
          ..add('expectedPackageVersion', expectedPackageVersion)
          ..add('expectedPromotionId', expectedPromotionId)
          ..add('expectedPromotionVersion', expectedPromotionVersion))
        .toString();
  }
}

class CreateOrderCommandBuilder
    implements Builder<CreateOrderCommand, CreateOrderCommandBuilder> {
  _$CreateOrderCommand? _$v;

  String? _packageId;
  String? get packageId => _$this._packageId;
  set packageId(String? packageId) => _$this._packageId = packageId;

  String? _branchId;
  String? get branchId => _$this._branchId;
  set branchId(String? branchId) => _$this._branchId = branchId;

  String? _slotId;
  String? get slotId => _$this._slotId;
  set slotId(String? slotId) => _$this._slotId = slotId;

  String? _voucherCode;
  String? get voucherCode => _$this._voucherCode;
  set voucherCode(String? voucherCode) => _$this._voucherCode = voucherCode;

  int? _expectedPackageVersion;
  int? get expectedPackageVersion => _$this._expectedPackageVersion;
  set expectedPackageVersion(int? expectedPackageVersion) =>
      _$this._expectedPackageVersion = expectedPackageVersion;

  String? _expectedPromotionId;
  String? get expectedPromotionId => _$this._expectedPromotionId;
  set expectedPromotionId(String? expectedPromotionId) =>
      _$this._expectedPromotionId = expectedPromotionId;

  int? _expectedPromotionVersion;
  int? get expectedPromotionVersion => _$this._expectedPromotionVersion;
  set expectedPromotionVersion(int? expectedPromotionVersion) =>
      _$this._expectedPromotionVersion = expectedPromotionVersion;

  CreateOrderCommandBuilder() {
    CreateOrderCommand._defaults(this);
  }

  CreateOrderCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _packageId = $v.packageId;
      _branchId = $v.branchId;
      _slotId = $v.slotId;
      _voucherCode = $v.voucherCode;
      _expectedPackageVersion = $v.expectedPackageVersion;
      _expectedPromotionId = $v.expectedPromotionId;
      _expectedPromotionVersion = $v.expectedPromotionVersion;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CreateOrderCommand other) {
    _$v = other as _$CreateOrderCommand;
  }

  @override
  void update(void Function(CreateOrderCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CreateOrderCommand build() => _build();

  _$CreateOrderCommand _build() {
    final _$result =
        _$v ??
        _$CreateOrderCommand._(
          packageId: BuiltValueNullFieldError.checkNotNull(
            packageId,
            r'CreateOrderCommand',
            'packageId',
          ),
          branchId: branchId,
          slotId: slotId,
          voucherCode: voucherCode,
          expectedPackageVersion: expectedPackageVersion,
          expectedPromotionId: expectedPromotionId,
          expectedPromotionVersion: expectedPromotionVersion,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
