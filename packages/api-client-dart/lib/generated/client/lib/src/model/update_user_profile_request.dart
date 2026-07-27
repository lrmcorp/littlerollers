//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/json_object.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'update_user_profile_request.g.dart';

/// UpdateUserProfileRequest
///
/// Properties:
/// * [displayName] 
/// * [phoneE164] 
/// * [expectedVersion] 
/// * [reason] 
@BuiltValue()
abstract class UpdateUserProfileRequest implements Built<UpdateUserProfileRequest, UpdateUserProfileRequestBuilder> {
  @BuiltValueField(wireName: r'displayName')
  String get displayName;

  @BuiltValueField(wireName: r'phoneE164')
  String? get phoneE164;

  @BuiltValueField(wireName: r'expectedVersion')
  int get expectedVersion;

  @BuiltValueField(wireName: r'reason')
  String get reason;

  UpdateUserProfileRequest._();

  factory UpdateUserProfileRequest([void updates(UpdateUserProfileRequestBuilder b)]) = _$UpdateUserProfileRequest;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(UpdateUserProfileRequestBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<UpdateUserProfileRequest> get serializer => _$UpdateUserProfileRequestSerializer();
}

class _$UpdateUserProfileRequestSerializer implements PrimitiveSerializer<UpdateUserProfileRequest> {
  @override
  final Iterable<Type> types = const [UpdateUserProfileRequest, _$UpdateUserProfileRequest];

  @override
  final String wireName = r'UpdateUserProfileRequest';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    UpdateUserProfileRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'displayName';
    yield serializers.serialize(
      object.displayName,
      specifiedType: const FullType(String),
    );
    if (object.phoneE164 != null) {
      yield r'phoneE164';
      yield serializers.serialize(
        object.phoneE164,
        specifiedType: const FullType(String),
      );
    }
    yield r'expectedVersion';
    yield serializers.serialize(
      object.expectedVersion,
      specifiedType: const FullType(int),
    );
    yield r'reason';
    yield serializers.serialize(
      object.reason,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    UpdateUserProfileRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required UpdateUserProfileRequestBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'displayName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.displayName = valueDes;
          break;
        case r'phoneE164':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.phoneE164 = valueDes;
          break;
        case r'expectedVersion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.expectedVersion = valueDes;
          break;
        case r'reason':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.reason = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  UpdateUserProfileRequest deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = UpdateUserProfileRequestBuilder();
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

