// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'package_promotion_update_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const PackagePromotionUpdateCommandDiscountTypeEnum
_$packagePromotionUpdateCommandDiscountTypeEnum_PERCENTAGE =
    const PackagePromotionUpdateCommandDiscountTypeEnum._('PERCENTAGE');
const PackagePromotionUpdateCommandDiscountTypeEnum
_$packagePromotionUpdateCommandDiscountTypeEnum_FIXED_AMOUNT =
    const PackagePromotionUpdateCommandDiscountTypeEnum._('FIXED_AMOUNT');

PackagePromotionUpdateCommandDiscountTypeEnum
_$packagePromotionUpdateCommandDiscountTypeEnumValueOf(String name) {
  switch (name) {
    case 'PERCENTAGE':
      return _$packagePromotionUpdateCommandDiscountTypeEnum_PERCENTAGE;
    case 'FIXED_AMOUNT':
      return _$packagePromotionUpdateCommandDiscountTypeEnum_FIXED_AMOUNT;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<PackagePromotionUpdateCommandDiscountTypeEnum>
_$packagePromotionUpdateCommandDiscountTypeEnumValues =
    BuiltSet<PackagePromotionUpdateCommandDiscountTypeEnum>(
      const <PackagePromotionUpdateCommandDiscountTypeEnum>[
        _$packagePromotionUpdateCommandDiscountTypeEnum_PERCENTAGE,
        _$packagePromotionUpdateCommandDiscountTypeEnum_FIXED_AMOUNT,
      ],
    );

Serializer<PackagePromotionUpdateCommandDiscountTypeEnum>
_$packagePromotionUpdateCommandDiscountTypeEnumSerializer =
    _$PackagePromotionUpdateCommandDiscountTypeEnumSerializer();

class _$PackagePromotionUpdateCommandDiscountTypeEnumSerializer
    implements
        PrimitiveSerializer<PackagePromotionUpdateCommandDiscountTypeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'PERCENTAGE': 'PERCENTAGE',
    'FIXED_AMOUNT': 'FIXED_AMOUNT',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'PERCENTAGE': 'PERCENTAGE',
    'FIXED_AMOUNT': 'FIXED_AMOUNT',
  };

  @override
  final Iterable<Type> types = const <Type>[
    PackagePromotionUpdateCommandDiscountTypeEnum,
  ];
  @override
  final String wireName = 'PackagePromotionUpdateCommandDiscountTypeEnum';

  @override
  Object serialize(
    Serializers serializers,
    PackagePromotionUpdateCommandDiscountTypeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  PackagePromotionUpdateCommandDiscountTypeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => PackagePromotionUpdateCommandDiscountTypeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$PackagePromotionUpdateCommand extends PackagePromotionUpdateCommand {
  @override
  final int expectedVersion;
  @override
  final String name;
  @override
  final String label;
  @override
  final PackagePromotionCommandDiscountTypeEnum discountType;
  @override
  final int discountValue;
  @override
  final DateTime activeFrom;
  @override
  final DateTime activeUntil;
  @override
  final String reason;

  factory _$PackagePromotionUpdateCommand([
    void Function(PackagePromotionUpdateCommandBuilder)? updates,
  ]) => (PackagePromotionUpdateCommandBuilder()..update(updates))._build();

  _$PackagePromotionUpdateCommand._({
    required this.expectedVersion,
    required this.name,
    required this.label,
    required this.discountType,
    required this.discountValue,
    required this.activeFrom,
    required this.activeUntil,
    required this.reason,
  }) : super._();
  @override
  PackagePromotionUpdateCommand rebuild(
    void Function(PackagePromotionUpdateCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PackagePromotionUpdateCommandBuilder toBuilder() =>
      PackagePromotionUpdateCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PackagePromotionUpdateCommand &&
        expectedVersion == other.expectedVersion &&
        name == other.name &&
        label == other.label &&
        discountType == other.discountType &&
        discountValue == other.discountValue &&
        activeFrom == other.activeFrom &&
        activeUntil == other.activeUntil &&
        reason == other.reason;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, expectedVersion.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, label.hashCode);
    _$hash = $jc(_$hash, discountType.hashCode);
    _$hash = $jc(_$hash, discountValue.hashCode);
    _$hash = $jc(_$hash, activeFrom.hashCode);
    _$hash = $jc(_$hash, activeUntil.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PackagePromotionUpdateCommand')
          ..add('expectedVersion', expectedVersion)
          ..add('name', name)
          ..add('label', label)
          ..add('discountType', discountType)
          ..add('discountValue', discountValue)
          ..add('activeFrom', activeFrom)
          ..add('activeUntil', activeUntil)
          ..add('reason', reason))
        .toString();
  }
}

class PackagePromotionUpdateCommandBuilder
    implements
        Builder<
          PackagePromotionUpdateCommand,
          PackagePromotionUpdateCommandBuilder
        >,
        PackagePromotionCommandBuilder {
  _$PackagePromotionUpdateCommand? _$v;

  int? _expectedVersion;
  int? get expectedVersion => _$this._expectedVersion;
  set expectedVersion(covariant int? expectedVersion) =>
      _$this._expectedVersion = expectedVersion;

  String? _name;
  String? get name => _$this._name;
  set name(covariant String? name) => _$this._name = name;

  String? _label;
  String? get label => _$this._label;
  set label(covariant String? label) => _$this._label = label;

  PackagePromotionCommandDiscountTypeEnum? _discountType;
  PackagePromotionCommandDiscountTypeEnum? get discountType =>
      _$this._discountType;
  set discountType(
    covariant PackagePromotionCommandDiscountTypeEnum? discountType,
  ) => _$this._discountType = discountType;

  int? _discountValue;
  int? get discountValue => _$this._discountValue;
  set discountValue(covariant int? discountValue) =>
      _$this._discountValue = discountValue;

  DateTime? _activeFrom;
  DateTime? get activeFrom => _$this._activeFrom;
  set activeFrom(covariant DateTime? activeFrom) =>
      _$this._activeFrom = activeFrom;

  DateTime? _activeUntil;
  DateTime? get activeUntil => _$this._activeUntil;
  set activeUntil(covariant DateTime? activeUntil) =>
      _$this._activeUntil = activeUntil;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(covariant String? reason) => _$this._reason = reason;

  PackagePromotionUpdateCommandBuilder() {
    PackagePromotionUpdateCommand._defaults(this);
  }

  PackagePromotionUpdateCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _expectedVersion = $v.expectedVersion;
      _name = $v.name;
      _label = $v.label;
      _discountType = $v.discountType;
      _discountValue = $v.discountValue;
      _activeFrom = $v.activeFrom;
      _activeUntil = $v.activeUntil;
      _reason = $v.reason;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(covariant PackagePromotionUpdateCommand other) {
    _$v = other as _$PackagePromotionUpdateCommand;
  }

  @override
  void update(void Function(PackagePromotionUpdateCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PackagePromotionUpdateCommand build() => _build();

  _$PackagePromotionUpdateCommand _build() {
    final _$result =
        _$v ??
        _$PackagePromotionUpdateCommand._(
          expectedVersion: BuiltValueNullFieldError.checkNotNull(
            expectedVersion,
            r'PackagePromotionUpdateCommand',
            'expectedVersion',
          ),
          name: BuiltValueNullFieldError.checkNotNull(
            name,
            r'PackagePromotionUpdateCommand',
            'name',
          ),
          label: BuiltValueNullFieldError.checkNotNull(
            label,
            r'PackagePromotionUpdateCommand',
            'label',
          ),
          discountType: BuiltValueNullFieldError.checkNotNull(
            discountType,
            r'PackagePromotionUpdateCommand',
            'discountType',
          ),
          discountValue: BuiltValueNullFieldError.checkNotNull(
            discountValue,
            r'PackagePromotionUpdateCommand',
            'discountValue',
          ),
          activeFrom: BuiltValueNullFieldError.checkNotNull(
            activeFrom,
            r'PackagePromotionUpdateCommand',
            'activeFrom',
          ),
          activeUntil: BuiltValueNullFieldError.checkNotNull(
            activeUntil,
            r'PackagePromotionUpdateCommand',
            'activeUntil',
          ),
          reason: BuiltValueNullFieldError.checkNotNull(
            reason,
            r'PackagePromotionUpdateCommand',
            'reason',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
