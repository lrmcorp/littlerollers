//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:openapi/src/model/me.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'session.g.dart';

/// Session
///
/// Properties:
/// * [accessToken] - Mobile only; web uses secure HttpOnly cookie
/// * [refreshToken] - Mobile only and returned only at issuance/rotation
/// * [user] 
/// * [assurance] 
/// * [channel] 
/// * [expiresAt] 
/// * [refreshExpiresAt] 
@BuiltValue()
abstract class Session implements Built<Session, SessionBuilder> {
  /// Mobile only; web uses secure HttpOnly cookie
  @BuiltValueField(wireName: r'accessToken')
  String? get accessToken;

  /// Mobile only and returned only at issuance/rotation
  @BuiltValueField(wireName: r'refreshToken')
  String? get refreshToken;

  @BuiltValueField(wireName: r'user')
  Me get user;

  @BuiltValueField(wireName: r'assurance')
  SessionAssuranceEnum get assurance;
  // enum assuranceEnum {  BASE,  MFA,  };

  @BuiltValueField(wireName: r'channel')
  SessionChannelEnum get channel;
  // enum channelEnum {  WEB,  MOBILE,  };

  @BuiltValueField(wireName: r'expiresAt')
  DateTime get expiresAt;

  @BuiltValueField(wireName: r'refreshExpiresAt')
  DateTime? get refreshExpiresAt;

  Session._();

  factory Session([void updates(SessionBuilder b)]) = _$Session;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(SessionBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<Session> get serializer => _$SessionSerializer();
}

class _$SessionSerializer implements PrimitiveSerializer<Session> {
  @override
  final Iterable<Type> types = const [Session, _$Session];

  @override
  final String wireName = r'Session';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    Session object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.accessToken != null) {
      yield r'accessToken';
      yield serializers.serialize(
        object.accessToken,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.refreshToken != null) {
      yield r'refreshToken';
      yield serializers.serialize(
        object.refreshToken,
        specifiedType: const FullType.nullable(String),
      );
    }
    yield r'user';
    yield serializers.serialize(
      object.user,
      specifiedType: const FullType(Me),
    );
    yield r'assurance';
    yield serializers.serialize(
      object.assurance,
      specifiedType: const FullType(SessionAssuranceEnum),
    );
    yield r'channel';
    yield serializers.serialize(
      object.channel,
      specifiedType: const FullType(SessionChannelEnum),
    );
    yield r'expiresAt';
    yield serializers.serialize(
      object.expiresAt,
      specifiedType: const FullType(DateTime),
    );
    if (object.refreshExpiresAt != null) {
      yield r'refreshExpiresAt';
      yield serializers.serialize(
        object.refreshExpiresAt,
        specifiedType: const FullType.nullable(DateTime),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    Session object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required SessionBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'accessToken':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.accessToken = valueDes;
          break;
        case r'refreshToken':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.refreshToken = valueDes;
          break;
        case r'user':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Me),
          ) as Me;
          result.user.replace(valueDes);
          break;
        case r'assurance':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(SessionAssuranceEnum),
          ) as SessionAssuranceEnum;
          result.assurance = valueDes;
          break;
        case r'channel':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(SessionChannelEnum),
          ) as SessionChannelEnum;
          result.channel = valueDes;
          break;
        case r'expiresAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.expiresAt = valueDes;
          break;
        case r'refreshExpiresAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.refreshExpiresAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  Session deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = SessionBuilder();
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

class SessionAssuranceEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'BASE')
  static const SessionAssuranceEnum BASE = _$sessionAssuranceEnum_BASE;
  @BuiltValueEnumConst(wireName: r'MFA')
  static const SessionAssuranceEnum MFA = _$sessionAssuranceEnum_MFA;

  static Serializer<SessionAssuranceEnum> get serializer => _$sessionAssuranceEnumSerializer;

  const SessionAssuranceEnum._(String name): super(name);

  static BuiltSet<SessionAssuranceEnum> get values => _$sessionAssuranceEnumValues;
  static SessionAssuranceEnum valueOf(String name) => _$sessionAssuranceEnumValueOf(name);
}

class SessionChannelEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'WEB')
  static const SessionChannelEnum WEB = _$sessionChannelEnum_WEB;
  @BuiltValueEnumConst(wireName: r'MOBILE')
  static const SessionChannelEnum MOBILE = _$sessionChannelEnum_MOBILE;

  static Serializer<SessionChannelEnum> get serializer => _$sessionChannelEnumSerializer;

  const SessionChannelEnum._(String name): super(name);

  static BuiltSet<SessionChannelEnum> get values => _$sessionChannelEnumValues;
  static SessionChannelEnum valueOf(String name) => _$sessionChannelEnumValueOf(name);
}

