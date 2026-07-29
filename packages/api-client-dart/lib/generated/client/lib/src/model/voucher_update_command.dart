//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/voucher_command.dart';
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'voucher_update_command.g.dart';

/// VoucherUpdateCommand
///
/// Properties:
/// * [code] 
/// * [name] 
/// * [description] 
/// * [discountType] 
/// * [discountValue] 
/// * [maxDiscountRp] 
/// * [minimumPurchaseRp] 
/// * [activeFrom] 
/// * [activeUntil] 
/// * [totalUsageLimit] 
/// * [perCustomerUsageLimit] 
/// * [branchId] 
/// * [classTypeId] 
/// * [packageIds] 
/// * [reason] 
/// * [expectedVersion] 
@BuiltValue()
abstract class VoucherUpdateCommand implements VoucherCommand, Built<VoucherUpdateCommand, VoucherUpdateCommandBuilder> {
  @BuiltValueField(wireName: r'expectedVersion')
  int get expectedVersion;

  VoucherUpdateCommand._();

  factory VoucherUpdateCommand([void updates(VoucherUpdateCommandBuilder b)]) = _$VoucherUpdateCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(VoucherUpdateCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<VoucherUpdateCommand> get serializer => _$VoucherUpdateCommandSerializer();
}

class _$VoucherUpdateCommandSerializer implements PrimitiveSerializer<VoucherUpdateCommand> {
  @override
  final Iterable<Type> types = const [VoucherUpdateCommand, _$VoucherUpdateCommand];

  @override
  final String wireName = r'VoucherUpdateCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    VoucherUpdateCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.branchId != null) {
      yield r'branchId';
      yield serializers.serialize(
        object.branchId,
        specifiedType: const FullType(String),
      );
    }
    yield r'reason';
    yield serializers.serialize(
      object.reason,
      specifiedType: const FullType(String),
    );
    if (object.minimumPurchaseRp != null) {
      yield r'minimumPurchaseRp';
      yield serializers.serialize(
        object.minimumPurchaseRp,
        specifiedType: const FullType(int),
      );
    }
    yield r'code';
    yield serializers.serialize(
      object.code,
      specifiedType: const FullType(String),
    );
    if (object.description != null) {
      yield r'description';
      yield serializers.serialize(
        object.description,
        specifiedType: const FullType(String),
      );
    }
    yield r'expectedVersion';
    yield serializers.serialize(
      object.expectedVersion,
      specifiedType: const FullType(int),
    );
    if (object.perCustomerUsageLimit != null) {
      yield r'perCustomerUsageLimit';
      yield serializers.serialize(
        object.perCustomerUsageLimit,
        specifiedType: const FullType.nullable(int),
      );
    }
    if (object.packageIds != null) {
      yield r'packageIds';
      yield serializers.serialize(
        object.packageIds,
        specifiedType: const FullType(BuiltSet, [FullType(String)]),
      );
    }
    if (object.classTypeId != null) {
      yield r'classTypeId';
      yield serializers.serialize(
        object.classTypeId,
        specifiedType: const FullType(String),
      );
    }
    if (object.totalUsageLimit != null) {
      yield r'totalUsageLimit';
      yield serializers.serialize(
        object.totalUsageLimit,
        specifiedType: const FullType.nullable(int),
      );
    }
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
    );
    yield r'discountType';
    yield serializers.serialize(
      object.discountType,
      specifiedType: const FullType(VoucherCommandDiscountTypeEnum),
    );
    if (object.maxDiscountRp != null) {
      yield r'maxDiscountRp';
      yield serializers.serialize(
        object.maxDiscountRp,
        specifiedType: const FullType.nullable(int),
      );
    }
    yield r'discountValue';
    yield serializers.serialize(
      object.discountValue,
      specifiedType: const FullType(int),
    );
    yield r'activeFrom';
    yield serializers.serialize(
      object.activeFrom,
      specifiedType: const FullType(DateTime),
    );
    if (object.activeUntil != null) {
      yield r'activeUntil';
      yield serializers.serialize(
        object.activeUntil,
        specifiedType: const FullType.nullable(DateTime),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    VoucherUpdateCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required VoucherUpdateCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'branchId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchId = valueDes;
          break;
        case r'reason':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.reason = valueDes;
          break;
        case r'minimumPurchaseRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.minimumPurchaseRp = valueDes;
          break;
        case r'code':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.code = valueDes;
          break;
        case r'description':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.description = valueDes;
          break;
        case r'expectedVersion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.expectedVersion = valueDes;
          break;
        case r'perCustomerUsageLimit':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(int),
          ) as int?;
          if (valueDes == null) continue;
          result.perCustomerUsageLimit = valueDes;
          break;
        case r'packageIds':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltSet, [FullType(String)]),
          ) as BuiltSet<String>;
          result.packageIds.replace(valueDes);
          break;
        case r'classTypeId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.classTypeId = valueDes;
          break;
        case r'totalUsageLimit':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(int),
          ) as int?;
          if (valueDes == null) continue;
          result.totalUsageLimit = valueDes;
          break;
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.name = valueDes;
          break;
        case r'discountType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(VoucherCommandDiscountTypeEnum),
          ) as VoucherCommandDiscountTypeEnum;
          result.discountType = valueDes;
          break;
        case r'maxDiscountRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(int),
          ) as int?;
          if (valueDes == null) continue;
          result.maxDiscountRp = valueDes;
          break;
        case r'discountValue':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.discountValue = valueDes;
          break;
        case r'activeFrom':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.activeFrom = valueDes;
          break;
        case r'activeUntil':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.activeUntil = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  VoucherUpdateCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = VoucherUpdateCommandBuilder();
    final serializedList = (serialized as Iterable<Object?>).toList();
    final unhandled = <Object?>[];
    _deserializeProperties(
      serializers,
      serialized,
      specifiedType: specifiedType,
      serializedList: serializedList,
      unhandled: unhandled,
      result: result,
    );
    return result.build();
  }
}

class VoucherUpdateCommandDiscountTypeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PERCENTAGE')
  static const VoucherUpdateCommandDiscountTypeEnum PERCENTAGE = _$voucherUpdateCommandDiscountTypeEnum_PERCENTAGE;
  @BuiltValueEnumConst(wireName: r'FIXED_AMOUNT')
  static const VoucherUpdateCommandDiscountTypeEnum FIXED_AMOUNT = _$voucherUpdateCommandDiscountTypeEnum_FIXED_AMOUNT;

  static Serializer<VoucherUpdateCommandDiscountTypeEnum> get serializer => _$voucherUpdateCommandDiscountTypeEnumSerializer;

  const VoucherUpdateCommandDiscountTypeEnum._(String name): super(name);

  static BuiltSet<VoucherUpdateCommandDiscountTypeEnum> get values => _$voucherUpdateCommandDiscountTypeEnumValues;
  static VoucherUpdateCommandDiscountTypeEnum valueOf(String name) => _$voucherUpdateCommandDiscountTypeEnumValueOf(name);
}

