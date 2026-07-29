//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/package.dart';
import 'package:openapi/src/model/package_promotion.dart';
import 'package:openapi/src/model/date.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'internal_package_detail.g.dart';

/// InternalPackageDetail
///
/// Properties:
/// * [id] 
/// * [branchId] 
/// * [classTypeId] 
/// * [businessKey] 
/// * [name] 
/// * [sessionCount] 
/// * [durationDays] 
/// * [priceRp] 
/// * [status] 
/// * [effectiveFrom] 
/// * [effectiveUntil] 
/// * [version] 
/// * [promotions] 
@BuiltValue()
abstract class InternalPackageDetail implements Package, Built<InternalPackageDetail, InternalPackageDetailBuilder> {
  @BuiltValueField(wireName: r'promotions')
  BuiltList<PackagePromotion> get promotions;

  InternalPackageDetail._();

  factory InternalPackageDetail([void updates(InternalPackageDetailBuilder b)]) = _$InternalPackageDetail;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(InternalPackageDetailBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<InternalPackageDetail> get serializer => _$InternalPackageDetailSerializer();
}

class _$InternalPackageDetailSerializer implements PrimitiveSerializer<InternalPackageDetail> {
  @override
  final Iterable<Type> types = const [InternalPackageDetail, _$InternalPackageDetail];

  @override
  final String wireName = r'InternalPackageDetail';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    InternalPackageDetail object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'branchId';
    yield serializers.serialize(
      object.branchId,
      specifiedType: const FullType(String),
    );
    if (object.effectiveUntil != null) {
      yield r'effectiveUntil';
      yield serializers.serialize(
        object.effectiveUntil,
        specifiedType: const FullType.nullable(Date),
      );
    }
    yield r'version';
    yield serializers.serialize(
      object.version,
      specifiedType: const FullType(int),
    );
    yield r'classTypeId';
    yield serializers.serialize(
      object.classTypeId,
      specifiedType: const FullType(String),
    );
    yield r'durationDays';
    yield serializers.serialize(
      object.durationDays,
      specifiedType: const FullType(int),
    );
    yield r'promotions';
    yield serializers.serialize(
      object.promotions,
      specifiedType: const FullType(BuiltList, [FullType(PackagePromotion)]),
    );
    yield r'sessionCount';
    yield serializers.serialize(
      object.sessionCount,
      specifiedType: const FullType(int),
    );
    yield r'businessKey';
    yield serializers.serialize(
      object.businessKey,
      specifiedType: const FullType(String),
    );
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
    );
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'effectiveFrom';
    yield serializers.serialize(
      object.effectiveFrom,
      specifiedType: const FullType(Date),
    );
    yield r'priceRp';
    yield serializers.serialize(
      object.priceRp,
      specifiedType: const FullType(int),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(PackageStatusEnum),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    InternalPackageDetail object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required InternalPackageDetailBuilder result,
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
        case r'effectiveUntil':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(Date),
          ) as Date?;
          if (valueDes == null) continue;
          result.effectiveUntil = valueDes;
          break;
        case r'version':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.version = valueDes;
          break;
        case r'classTypeId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.classTypeId = valueDes;
          break;
        case r'durationDays':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.durationDays = valueDes;
          break;
        case r'promotions':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(PackagePromotion)]),
          ) as BuiltList<PackagePromotion>;
          result.promotions.replace(valueDes);
          break;
        case r'sessionCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.sessionCount = valueDes;
          break;
        case r'businessKey':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.businessKey = valueDes;
          break;
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.name = valueDes;
          break;
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'effectiveFrom':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Date),
          ) as Date;
          result.effectiveFrom = valueDes;
          break;
        case r'priceRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.priceRp = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PackageStatusEnum),
          ) as PackageStatusEnum;
          result.status = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  InternalPackageDetail deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = InternalPackageDetailBuilder();
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

class InternalPackageDetailStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ACTIVE')
  static const InternalPackageDetailStatusEnum ACTIVE = _$internalPackageDetailStatusEnum_ACTIVE;
  @BuiltValueEnumConst(wireName: r'INACTIVE')
  static const InternalPackageDetailStatusEnum INACTIVE = _$internalPackageDetailStatusEnum_INACTIVE;

  static Serializer<InternalPackageDetailStatusEnum> get serializer => _$internalPackageDetailStatusEnumSerializer;

  const InternalPackageDetailStatusEnum._(String name): super(name);

  static BuiltSet<InternalPackageDetailStatusEnum> get values => _$internalPackageDetailStatusEnumValues;
  static InternalPackageDetailStatusEnum valueOf(String name) => _$internalPackageDetailStatusEnumValueOf(name);
}

