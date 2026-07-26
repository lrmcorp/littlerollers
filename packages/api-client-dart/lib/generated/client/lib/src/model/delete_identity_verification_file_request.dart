//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'delete_identity_verification_file_request.g.dart';

/// DeleteIdentityVerificationFileRequest
///
/// Properties:
/// * [expectedVersion] 
/// * [reason] 
@BuiltValue()
abstract class DeleteIdentityVerificationFileRequest implements Built<DeleteIdentityVerificationFileRequest, DeleteIdentityVerificationFileRequestBuilder> {
  @BuiltValueField(wireName: r'expectedVersion')
  int get expectedVersion;

  @BuiltValueField(wireName: r'reason')
  String get reason;

  DeleteIdentityVerificationFileRequest._();

  factory DeleteIdentityVerificationFileRequest([void updates(DeleteIdentityVerificationFileRequestBuilder b)]) = _$DeleteIdentityVerificationFileRequest;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(DeleteIdentityVerificationFileRequestBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<DeleteIdentityVerificationFileRequest> get serializer => _$DeleteIdentityVerificationFileRequestSerializer();
}

class _$DeleteIdentityVerificationFileRequestSerializer implements PrimitiveSerializer<DeleteIdentityVerificationFileRequest> {
  @override
  final Iterable<Type> types = const [DeleteIdentityVerificationFileRequest, _$DeleteIdentityVerificationFileRequest];

  @override
  final String wireName = r'DeleteIdentityVerificationFileRequest';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    DeleteIdentityVerificationFileRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
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
    DeleteIdentityVerificationFileRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required DeleteIdentityVerificationFileRequestBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
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
  DeleteIdentityVerificationFileRequest deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = DeleteIdentityVerificationFileRequestBuilder();
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

