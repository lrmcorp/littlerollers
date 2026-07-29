//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/public_branch.dart';
import 'package:openapi/src/model/public_package_profile.dart';
import 'package:openapi/src/model/public_package_promotion.dart';
import 'package:openapi/src/model/public_class_type_ref.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'public_package_summary.g.dart';

/// PublicPackageSummary
///
/// Properties:
/// * [id] 
/// * [branchId] 
/// * [name] 
/// * [sessionCount] 
/// * [durationDays] 
/// * [priceRp] 
/// * [effectivePriceRp] 
/// * [promotion] 
/// * [effectiveUntil] 
/// * [classType] 
/// * [publicProfile] 
/// * [branch] 
@BuiltValue(instantiable: false)
abstract class PublicPackageSummary  {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'branchId')
  String? get branchId;

  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'sessionCount')
  int get sessionCount;

  @BuiltValueField(wireName: r'durationDays')
  int get durationDays;

  @BuiltValueField(wireName: r'priceRp')
  int get priceRp;

  @BuiltValueField(wireName: r'effectivePriceRp')
  int get effectivePriceRp;

  @BuiltValueField(wireName: r'promotion')
  PublicPackagePromotion? get promotion;

  @BuiltValueField(wireName: r'effectiveUntil')
  DateTime? get effectiveUntil;

  @BuiltValueField(wireName: r'classType')
  PublicClassTypeRef? get classType;

  @BuiltValueField(wireName: r'publicProfile')
  PublicPackageProfile? get publicProfile;

  @BuiltValueField(wireName: r'branch')
  PublicBranch? get branch;

  @BuiltValueSerializer(custom: true)
  static Serializer<PublicPackageSummary> get serializer => _$PublicPackageSummarySerializer();
}

class _$PublicPackageSummarySerializer implements PrimitiveSerializer<PublicPackageSummary> {
  @override
  final Iterable<Type> types = const [PublicPackageSummary];

  @override
  final String wireName = r'PublicPackageSummary';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PublicPackageSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    if (object.branchId != null) {
      yield r'branchId';
      yield serializers.serialize(
        object.branchId,
        specifiedType: const FullType(String),
      );
    }
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
    );
    yield r'sessionCount';
    yield serializers.serialize(
      object.sessionCount,
      specifiedType: const FullType(int),
    );
    yield r'durationDays';
    yield serializers.serialize(
      object.durationDays,
      specifiedType: const FullType(int),
    );
    yield r'priceRp';
    yield serializers.serialize(
      object.priceRp,
      specifiedType: const FullType(int),
    );
    yield r'effectivePriceRp';
    yield serializers.serialize(
      object.effectivePriceRp,
      specifiedType: const FullType(int),
    );
    yield r'promotion';
    yield object.promotion == null ? null : serializers.serialize(
      object.promotion,
      specifiedType: const FullType.nullable(PublicPackagePromotion),
    );
    if (object.effectiveUntil != null) {
      yield r'effectiveUntil';
      yield serializers.serialize(
        object.effectiveUntil,
        specifiedType: const FullType.nullable(DateTime),
      );
    }
    if (object.classType != null) {
      yield r'classType';
      yield serializers.serialize(
        object.classType,
        specifiedType: const FullType(PublicClassTypeRef),
      );
    }
    if (object.publicProfile != null) {
      yield r'publicProfile';
      yield serializers.serialize(
        object.publicProfile,
        specifiedType: const FullType(PublicPackageProfile),
      );
    }
    if (object.branch != null) {
      yield r'branch';
      yield serializers.serialize(
        object.branch,
        specifiedType: const FullType(PublicBranch),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    PublicPackageSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  @override
  PublicPackageSummary deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return serializers.deserialize(serialized, specifiedType: FullType($PublicPackageSummary)) as $PublicPackageSummary;
  }
}

/// a concrete implementation of [PublicPackageSummary], since [PublicPackageSummary] is not instantiable
@BuiltValue(instantiable: true)
abstract class $PublicPackageSummary implements PublicPackageSummary, Built<$PublicPackageSummary, $PublicPackageSummaryBuilder> {
  $PublicPackageSummary._();

  factory $PublicPackageSummary([void Function($PublicPackageSummaryBuilder)? updates]) = _$$PublicPackageSummary;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults($PublicPackageSummaryBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<$PublicPackageSummary> get serializer => _$$PublicPackageSummarySerializer();
}

class _$$PublicPackageSummarySerializer implements PrimitiveSerializer<$PublicPackageSummary> {
  @override
  final Iterable<Type> types = const [$PublicPackageSummary, _$$PublicPackageSummary];

  @override
  final String wireName = r'$PublicPackageSummary';

  @override
  Object serialize(
    Serializers serializers,
    $PublicPackageSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return serializers.serialize(object, specifiedType: FullType(PublicPackageSummary))!;
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PublicPackageSummaryBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'branchId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchId = valueDes;
          break;
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.name = valueDes;
          break;
        case r'sessionCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.sessionCount = valueDes;
          break;
        case r'durationDays':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.durationDays = valueDes;
          break;
        case r'priceRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.priceRp = valueDes;
          break;
        case r'effectivePriceRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.effectivePriceRp = valueDes;
          break;
        case r'promotion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(PublicPackagePromotion),
          ) as PublicPackagePromotion?;
          if (valueDes == null) continue;
          result.promotion.replace(valueDes);
          break;
        case r'effectiveUntil':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.effectiveUntil = valueDes;
          break;
        case r'classType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PublicClassTypeRef),
          ) as PublicClassTypeRef;
          result.classType.replace(valueDes);
          break;
        case r'publicProfile':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PublicPackageProfile),
          ) as PublicPackageProfile;
          result.publicProfile.replace(valueDes);
          break;
        case r'branch':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PublicBranch),
          ) as PublicBranch;
          result.branch = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  $PublicPackageSummary deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = $PublicPackageSummaryBuilder();
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

