//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'audit_actor_projection.g.dart';

/// AuditActorProjection
///
/// Properties:
/// * [id] 
/// * [displayName] 
@BuiltValue()
abstract class AuditActorProjection implements Built<AuditActorProjection, AuditActorProjectionBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'displayName')
  String get displayName;

  AuditActorProjection._();

  factory AuditActorProjection([void updates(AuditActorProjectionBuilder b)]) = _$AuditActorProjection;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AuditActorProjectionBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AuditActorProjection> get serializer => _$AuditActorProjectionSerializer();
}

class _$AuditActorProjectionSerializer implements PrimitiveSerializer<AuditActorProjection> {
  @override
  final Iterable<Type> types = const [AuditActorProjection, _$AuditActorProjection];

  @override
  final String wireName = r'AuditActorProjection';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AuditActorProjection object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'displayName';
    yield serializers.serialize(
      object.displayName,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AuditActorProjection object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AuditActorProjectionBuilder result,
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
        case r'displayName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.displayName = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AuditActorProjection deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AuditActorProjectionBuilder();
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

