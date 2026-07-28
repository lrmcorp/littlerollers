//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'access_role_capability.g.dart';

/// AccessRoleCapability
///
/// Properties:
/// * [key] 
/// * [label] 
/// * [category] 
/// * [sensitive] 
/// * [systemOnly] 
/// * [globalOnly] 
@BuiltValue()
abstract class AccessRoleCapability implements Built<AccessRoleCapability, AccessRoleCapabilityBuilder> {
  @BuiltValueField(wireName: r'key')
  String get key;

  @BuiltValueField(wireName: r'label')
  String get label;

  @BuiltValueField(wireName: r'category')
  String get category;

  @BuiltValueField(wireName: r'sensitive')
  bool get sensitive;

  @BuiltValueField(wireName: r'systemOnly')
  bool get systemOnly;

  @BuiltValueField(wireName: r'globalOnly')
  bool get globalOnly;

  AccessRoleCapability._();

  factory AccessRoleCapability([void updates(AccessRoleCapabilityBuilder b)]) = _$AccessRoleCapability;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AccessRoleCapabilityBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AccessRoleCapability> get serializer => _$AccessRoleCapabilitySerializer();
}

class _$AccessRoleCapabilitySerializer implements PrimitiveSerializer<AccessRoleCapability> {
  @override
  final Iterable<Type> types = const [AccessRoleCapability, _$AccessRoleCapability];

  @override
  final String wireName = r'AccessRoleCapability';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AccessRoleCapability object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'key';
    yield serializers.serialize(
      object.key,
      specifiedType: const FullType(String),
    );
    yield r'label';
    yield serializers.serialize(
      object.label,
      specifiedType: const FullType(String),
    );
    yield r'category';
    yield serializers.serialize(
      object.category,
      specifiedType: const FullType(String),
    );
    yield r'sensitive';
    yield serializers.serialize(
      object.sensitive,
      specifiedType: const FullType(bool),
    );
    yield r'systemOnly';
    yield serializers.serialize(
      object.systemOnly,
      specifiedType: const FullType(bool),
    );
    yield r'globalOnly';
    yield serializers.serialize(
      object.globalOnly,
      specifiedType: const FullType(bool),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AccessRoleCapability object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AccessRoleCapabilityBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'key':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.key = valueDes;
          break;
        case r'label':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.label = valueDes;
          break;
        case r'category':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.category = valueDes;
          break;
        case r'sensitive':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.sensitive = valueDes;
          break;
        case r'systemOnly':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.systemOnly = valueDes;
          break;
        case r'globalOnly':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.globalOnly = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AccessRoleCapability deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AccessRoleCapabilityBuilder();
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

