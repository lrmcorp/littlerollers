//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'safe_audit_activity.g.dart';

/// SafeAuditActivity
///
/// Properties:
/// * [id] 
/// * [action] 
/// * [occurredAt] 
@BuiltValue()
abstract class SafeAuditActivity implements Built<SafeAuditActivity, SafeAuditActivityBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'action')
  String get action;

  @BuiltValueField(wireName: r'occurredAt')
  DateTime get occurredAt;

  SafeAuditActivity._();

  factory SafeAuditActivity([void updates(SafeAuditActivityBuilder b)]) = _$SafeAuditActivity;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(SafeAuditActivityBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<SafeAuditActivity> get serializer => _$SafeAuditActivitySerializer();
}

class _$SafeAuditActivitySerializer implements PrimitiveSerializer<SafeAuditActivity> {
  @override
  final Iterable<Type> types = const [SafeAuditActivity, _$SafeAuditActivity];

  @override
  final String wireName = r'SafeAuditActivity';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    SafeAuditActivity object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'action';
    yield serializers.serialize(
      object.action,
      specifiedType: const FullType(String),
    );
    yield r'occurredAt';
    yield serializers.serialize(
      object.occurredAt,
      specifiedType: const FullType(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    SafeAuditActivity object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required SafeAuditActivityBuilder result,
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
        case r'action':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.action = valueDes;
          break;
        case r'occurredAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.occurredAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  SafeAuditActivity deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = SafeAuditActivityBuilder();
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

