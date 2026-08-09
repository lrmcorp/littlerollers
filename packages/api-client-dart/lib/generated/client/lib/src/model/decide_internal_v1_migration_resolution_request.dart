//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/json_object.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'decide_internal_v1_migration_resolution_request.g.dart';

/// DecideInternalV1MigrationResolutionRequest
///
/// Properties:
/// * [approve] 
/// * [reason] 
/// * [decision] 
@BuiltValue()
abstract class DecideInternalV1MigrationResolutionRequest implements Built<DecideInternalV1MigrationResolutionRequest, DecideInternalV1MigrationResolutionRequestBuilder> {
  @BuiltValueField(wireName: r'approve')
  bool get approve;

  @BuiltValueField(wireName: r'reason')
  String get reason;

  @BuiltValueField(wireName: r'decision')
  JsonObject? get decision;

  DecideInternalV1MigrationResolutionRequest._();

  factory DecideInternalV1MigrationResolutionRequest([void updates(DecideInternalV1MigrationResolutionRequestBuilder b)]) = _$DecideInternalV1MigrationResolutionRequest;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(DecideInternalV1MigrationResolutionRequestBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<DecideInternalV1MigrationResolutionRequest> get serializer => _$DecideInternalV1MigrationResolutionRequestSerializer();
}

class _$DecideInternalV1MigrationResolutionRequestSerializer implements PrimitiveSerializer<DecideInternalV1MigrationResolutionRequest> {
  @override
  final Iterable<Type> types = const [DecideInternalV1MigrationResolutionRequest, _$DecideInternalV1MigrationResolutionRequest];

  @override
  final String wireName = r'DecideInternalV1MigrationResolutionRequest';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    DecideInternalV1MigrationResolutionRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'approve';
    yield serializers.serialize(
      object.approve,
      specifiedType: const FullType(bool),
    );
    yield r'reason';
    yield serializers.serialize(
      object.reason,
      specifiedType: const FullType(String),
    );
    if (object.decision != null) {
      yield r'decision';
      yield serializers.serialize(
        object.decision,
        specifiedType: const FullType(JsonObject),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    DecideInternalV1MigrationResolutionRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required DecideInternalV1MigrationResolutionRequestBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'approve':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.approve = valueDes;
          break;
        case r'reason':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.reason = valueDes;
          break;
        case r'decision':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(JsonObject),
          ) as JsonObject;
          result.decision = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  DecideInternalV1MigrationResolutionRequest deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = DecideInternalV1MigrationResolutionRequestBuilder();
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

