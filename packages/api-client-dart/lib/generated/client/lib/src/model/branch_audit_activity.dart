//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'branch_audit_activity.g.dart';

/// BranchAuditActivity
///
/// Properties:
/// * [id] 
/// * [action] 
/// * [objectType] 
/// * [occurredAt] 
@BuiltValue()
abstract class BranchAuditActivity implements Built<BranchAuditActivity, BranchAuditActivityBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'action')
  String get action;

  @BuiltValueField(wireName: r'objectType')
  String get objectType;

  @BuiltValueField(wireName: r'occurredAt')
  DateTime get occurredAt;

  BranchAuditActivity._();

  factory BranchAuditActivity([void updates(BranchAuditActivityBuilder b)]) = _$BranchAuditActivity;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(BranchAuditActivityBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<BranchAuditActivity> get serializer => _$BranchAuditActivitySerializer();
}

class _$BranchAuditActivitySerializer implements PrimitiveSerializer<BranchAuditActivity> {
  @override
  final Iterable<Type> types = const [BranchAuditActivity, _$BranchAuditActivity];

  @override
  final String wireName = r'BranchAuditActivity';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    BranchAuditActivity object, {
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
    yield r'objectType';
    yield serializers.serialize(
      object.objectType,
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
    BranchAuditActivity object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required BranchAuditActivityBuilder result,
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
        case r'objectType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.objectType = valueDes;
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
  BranchAuditActivity deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = BranchAuditActivityBuilder();
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

