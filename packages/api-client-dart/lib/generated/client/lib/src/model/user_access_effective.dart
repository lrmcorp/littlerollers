//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/effective_capability_grant.dart';
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/effective_capability_denial.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'user_access_effective.g.dart';

/// UserAccessEffective
///
/// Properties:
/// * [capabilities] 
/// * [branches] 
/// * [grants] 
/// * [denials] 
@BuiltValue()
abstract class UserAccessEffective implements Built<UserAccessEffective, UserAccessEffectiveBuilder> {
  @BuiltValueField(wireName: r'capabilities')
  BuiltList<String> get capabilities;

  @BuiltValueField(wireName: r'branches')
  BuiltList<String> get branches;

  @BuiltValueField(wireName: r'grants')
  BuiltList<EffectiveCapabilityGrant> get grants;

  @BuiltValueField(wireName: r'denials')
  BuiltList<EffectiveCapabilityDenial> get denials;

  UserAccessEffective._();

  factory UserAccessEffective([void updates(UserAccessEffectiveBuilder b)]) = _$UserAccessEffective;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(UserAccessEffectiveBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<UserAccessEffective> get serializer => _$UserAccessEffectiveSerializer();
}

class _$UserAccessEffectiveSerializer implements PrimitiveSerializer<UserAccessEffective> {
  @override
  final Iterable<Type> types = const [UserAccessEffective, _$UserAccessEffective];

  @override
  final String wireName = r'UserAccessEffective';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    UserAccessEffective object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'capabilities';
    yield serializers.serialize(
      object.capabilities,
      specifiedType: const FullType(BuiltList, [FullType(String)]),
    );
    yield r'branches';
    yield serializers.serialize(
      object.branches,
      specifiedType: const FullType(BuiltList, [FullType(String)]),
    );
    yield r'grants';
    yield serializers.serialize(
      object.grants,
      specifiedType: const FullType(BuiltList, [FullType(EffectiveCapabilityGrant)]),
    );
    yield r'denials';
    yield serializers.serialize(
      object.denials,
      specifiedType: const FullType(BuiltList, [FullType(EffectiveCapabilityDenial)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    UserAccessEffective object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required UserAccessEffectiveBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'capabilities':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.capabilities.replace(valueDes);
          break;
        case r'branches':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.branches.replace(valueDes);
          break;
        case r'grants':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(EffectiveCapabilityGrant)]),
          ) as BuiltList<EffectiveCapabilityGrant>;
          result.grants.replace(valueDes);
          break;
        case r'denials':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(EffectiveCapabilityDenial)]),
          ) as BuiltList<EffectiveCapabilityDenial>;
          result.denials.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  UserAccessEffective deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = UserAccessEffectiveBuilder();
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

