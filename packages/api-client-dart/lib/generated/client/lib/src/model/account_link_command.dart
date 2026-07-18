//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'account_link_command.g.dart';

/// AccountLinkCommand
///
/// Properties:
/// * [provider] 
/// * [verifiedProviderToken] 
/// * [expectedUserId] 
@BuiltValue()
abstract class AccountLinkCommand implements Built<AccountLinkCommand, AccountLinkCommandBuilder> {
  @BuiltValueField(wireName: r'provider')
  AccountLinkCommandProviderEnum get provider;
  // enum providerEnum {  GOOGLE,  WHATSAPP_PHONE,  };

  @BuiltValueField(wireName: r'verifiedProviderToken')
  String get verifiedProviderToken;

  @BuiltValueField(wireName: r'expectedUserId')
  String? get expectedUserId;

  AccountLinkCommand._();

  factory AccountLinkCommand([void updates(AccountLinkCommandBuilder b)]) = _$AccountLinkCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AccountLinkCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AccountLinkCommand> get serializer => _$AccountLinkCommandSerializer();
}

class _$AccountLinkCommandSerializer implements PrimitiveSerializer<AccountLinkCommand> {
  @override
  final Iterable<Type> types = const [AccountLinkCommand, _$AccountLinkCommand];

  @override
  final String wireName = r'AccountLinkCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AccountLinkCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'provider';
    yield serializers.serialize(
      object.provider,
      specifiedType: const FullType(AccountLinkCommandProviderEnum),
    );
    yield r'verifiedProviderToken';
    yield serializers.serialize(
      object.verifiedProviderToken,
      specifiedType: const FullType(String),
    );
    if (object.expectedUserId != null) {
      yield r'expectedUserId';
      yield serializers.serialize(
        object.expectedUserId,
        specifiedType: const FullType(String),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    AccountLinkCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AccountLinkCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'provider':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(AccountLinkCommandProviderEnum),
          ) as AccountLinkCommandProviderEnum;
          result.provider = valueDes;
          break;
        case r'verifiedProviderToken':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.verifiedProviderToken = valueDes;
          break;
        case r'expectedUserId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.expectedUserId = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AccountLinkCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AccountLinkCommandBuilder();
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

class AccountLinkCommandProviderEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'GOOGLE')
  static const AccountLinkCommandProviderEnum GOOGLE = _$accountLinkCommandProviderEnum_GOOGLE;
  @BuiltValueEnumConst(wireName: r'WHATSAPP_PHONE')
  static const AccountLinkCommandProviderEnum WHATSAPP_PHONE = _$accountLinkCommandProviderEnum_WHATSAPP_PHONE;

  static Serializer<AccountLinkCommandProviderEnum> get serializer => _$accountLinkCommandProviderEnumSerializer;

  const AccountLinkCommandProviderEnum._(String name): super(name);

  static BuiltSet<AccountLinkCommandProviderEnum> get values => _$accountLinkCommandProviderEnumValues;
  static AccountLinkCommandProviderEnum valueOf(String name) => _$accountLinkCommandProviderEnumValueOf(name);
}

