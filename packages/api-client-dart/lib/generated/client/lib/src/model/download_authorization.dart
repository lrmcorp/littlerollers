//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'download_authorization.g.dart';

/// DownloadAuthorization
///
/// Properties:
/// * [url] - Never log or send to analytics
/// * [expiresAt] 
@BuiltValue()
abstract class DownloadAuthorization implements Built<DownloadAuthorization, DownloadAuthorizationBuilder> {
  /// Never log or send to analytics
  @BuiltValueField(wireName: r'url')
  String get url;

  @BuiltValueField(wireName: r'expiresAt')
  DateTime get expiresAt;

  DownloadAuthorization._();

  factory DownloadAuthorization([void updates(DownloadAuthorizationBuilder b)]) = _$DownloadAuthorization;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(DownloadAuthorizationBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<DownloadAuthorization> get serializer => _$DownloadAuthorizationSerializer();
}

class _$DownloadAuthorizationSerializer implements PrimitiveSerializer<DownloadAuthorization> {
  @override
  final Iterable<Type> types = const [DownloadAuthorization, _$DownloadAuthorization];

  @override
  final String wireName = r'DownloadAuthorization';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    DownloadAuthorization object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'url';
    yield serializers.serialize(
      object.url,
      specifiedType: const FullType(String),
    );
    yield r'expiresAt';
    yield serializers.serialize(
      object.expiresAt,
      specifiedType: const FullType(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    DownloadAuthorization object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required DownloadAuthorizationBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'url':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.url = valueDes;
          break;
        case r'expiresAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.expiresAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  DownloadAuthorization deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = DownloadAuthorizationBuilder();
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

