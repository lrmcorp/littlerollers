// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'adjustment_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const AdjustmentCommandReasonCodeEnum
_$adjustmentCommandReasonCodeEnum_MIGRATION_CORRECTION =
    const AdjustmentCommandReasonCodeEnum._('MIGRATION_CORRECTION');
const AdjustmentCommandReasonCodeEnum
_$adjustmentCommandReasonCodeEnum_ATTENDANCE_CORRECTION =
    const AdjustmentCommandReasonCodeEnum._('ATTENDANCE_CORRECTION');
const AdjustmentCommandReasonCodeEnum
_$adjustmentCommandReasonCodeEnum_PACKAGE_COMPENSATION =
    const AdjustmentCommandReasonCodeEnum._('PACKAGE_COMPENSATION');
const AdjustmentCommandReasonCodeEnum
_$adjustmentCommandReasonCodeEnum_SUPPORT_RECONCILIATION =
    const AdjustmentCommandReasonCodeEnum._('SUPPORT_RECONCILIATION');

AdjustmentCommandReasonCodeEnum _$adjustmentCommandReasonCodeEnumValueOf(
  String name,
) {
  switch (name) {
    case 'MIGRATION_CORRECTION':
      return _$adjustmentCommandReasonCodeEnum_MIGRATION_CORRECTION;
    case 'ATTENDANCE_CORRECTION':
      return _$adjustmentCommandReasonCodeEnum_ATTENDANCE_CORRECTION;
    case 'PACKAGE_COMPENSATION':
      return _$adjustmentCommandReasonCodeEnum_PACKAGE_COMPENSATION;
    case 'SUPPORT_RECONCILIATION':
      return _$adjustmentCommandReasonCodeEnum_SUPPORT_RECONCILIATION;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<AdjustmentCommandReasonCodeEnum>
_$adjustmentCommandReasonCodeEnumValues =
    BuiltSet<AdjustmentCommandReasonCodeEnum>(
      const <AdjustmentCommandReasonCodeEnum>[
        _$adjustmentCommandReasonCodeEnum_MIGRATION_CORRECTION,
        _$adjustmentCommandReasonCodeEnum_ATTENDANCE_CORRECTION,
        _$adjustmentCommandReasonCodeEnum_PACKAGE_COMPENSATION,
        _$adjustmentCommandReasonCodeEnum_SUPPORT_RECONCILIATION,
      ],
    );

Serializer<AdjustmentCommandReasonCodeEnum>
_$adjustmentCommandReasonCodeEnumSerializer =
    _$AdjustmentCommandReasonCodeEnumSerializer();

class _$AdjustmentCommandReasonCodeEnumSerializer
    implements PrimitiveSerializer<AdjustmentCommandReasonCodeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'MIGRATION_CORRECTION': 'MIGRATION_CORRECTION',
    'ATTENDANCE_CORRECTION': 'ATTENDANCE_CORRECTION',
    'PACKAGE_COMPENSATION': 'PACKAGE_COMPENSATION',
    'SUPPORT_RECONCILIATION': 'SUPPORT_RECONCILIATION',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'MIGRATION_CORRECTION': 'MIGRATION_CORRECTION',
    'ATTENDANCE_CORRECTION': 'ATTENDANCE_CORRECTION',
    'PACKAGE_COMPENSATION': 'PACKAGE_COMPENSATION',
    'SUPPORT_RECONCILIATION': 'SUPPORT_RECONCILIATION',
  };

  @override
  final Iterable<Type> types = const <Type>[AdjustmentCommandReasonCodeEnum];
  @override
  final String wireName = 'AdjustmentCommandReasonCodeEnum';

  @override
  Object serialize(
    Serializers serializers,
    AdjustmentCommandReasonCodeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  AdjustmentCommandReasonCodeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => AdjustmentCommandReasonCodeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$AdjustmentCommand extends AdjustmentCommand {
  @override
  final String customerPackageId;
  @override
  final int quantity;
  @override
  final AdjustmentCommandReasonCodeEnum reasonCode;

  factory _$AdjustmentCommand([
    void Function(AdjustmentCommandBuilder)? updates,
  ]) => (AdjustmentCommandBuilder()..update(updates))._build();

  _$AdjustmentCommand._({
    required this.customerPackageId,
    required this.quantity,
    required this.reasonCode,
  }) : super._();
  @override
  AdjustmentCommand rebuild(void Function(AdjustmentCommandBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AdjustmentCommandBuilder toBuilder() =>
      AdjustmentCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AdjustmentCommand &&
        customerPackageId == other.customerPackageId &&
        quantity == other.quantity &&
        reasonCode == other.reasonCode;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, customerPackageId.hashCode);
    _$hash = $jc(_$hash, quantity.hashCode);
    _$hash = $jc(_$hash, reasonCode.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AdjustmentCommand')
          ..add('customerPackageId', customerPackageId)
          ..add('quantity', quantity)
          ..add('reasonCode', reasonCode))
        .toString();
  }
}

class AdjustmentCommandBuilder
    implements Builder<AdjustmentCommand, AdjustmentCommandBuilder> {
  _$AdjustmentCommand? _$v;

  String? _customerPackageId;
  String? get customerPackageId => _$this._customerPackageId;
  set customerPackageId(String? customerPackageId) =>
      _$this._customerPackageId = customerPackageId;

  int? _quantity;
  int? get quantity => _$this._quantity;
  set quantity(int? quantity) => _$this._quantity = quantity;

  AdjustmentCommandReasonCodeEnum? _reasonCode;
  AdjustmentCommandReasonCodeEnum? get reasonCode => _$this._reasonCode;
  set reasonCode(AdjustmentCommandReasonCodeEnum? reasonCode) =>
      _$this._reasonCode = reasonCode;

  AdjustmentCommandBuilder() {
    AdjustmentCommand._defaults(this);
  }

  AdjustmentCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _customerPackageId = $v.customerPackageId;
      _quantity = $v.quantity;
      _reasonCode = $v.reasonCode;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AdjustmentCommand other) {
    _$v = other as _$AdjustmentCommand;
  }

  @override
  void update(void Function(AdjustmentCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AdjustmentCommand build() => _build();

  _$AdjustmentCommand _build() {
    final _$result =
        _$v ??
        _$AdjustmentCommand._(
          customerPackageId: BuiltValueNullFieldError.checkNotNull(
            customerPackageId,
            r'AdjustmentCommand',
            'customerPackageId',
          ),
          quantity: BuiltValueNullFieldError.checkNotNull(
            quantity,
            r'AdjustmentCommand',
            'quantity',
          ),
          reasonCode: BuiltValueNullFieldError.checkNotNull(
            reasonCode,
            r'AdjustmentCommand',
            'reasonCode',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
