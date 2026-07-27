//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/json_object.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'user_notification.g.dart';

/// UserNotification
///
/// Properties:
/// * [id] 
/// * [category] 
/// * [tone] 
/// * [title] 
/// * [message] 
/// * [href] 
/// * [branchId] 
/// * [metadataMasked] 
/// * [readAt] 
/// * [expiresAt] 
/// * [createdAt] 
@BuiltValue()
abstract class UserNotification implements Built<UserNotification, UserNotificationBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'category')
  UserNotificationCategoryEnum get category;
  // enum categoryEnum {  VERIFICATION,  PAYMENT,  PACKAGE,  BOOKING,  RESCHEDULE,  CLASS,  ATTENDANCE,  ADJUSTMENT,  OPERATIONS,  APPROVAL,  SYSTEM,  };

  @BuiltValueField(wireName: r'tone')
  UserNotificationToneEnum get tone;
  // enum toneEnum {  success,  info,  warning,  danger,  };

  @BuiltValueField(wireName: r'title')
  String get title;

  @BuiltValueField(wireName: r'message')
  String get message;

  @BuiltValueField(wireName: r'href')
  String? get href;

  @BuiltValueField(wireName: r'branchId')
  String? get branchId;

  @BuiltValueField(wireName: r'metadataMasked')
  JsonObject? get metadataMasked;

  @BuiltValueField(wireName: r'readAt')
  DateTime? get readAt;

  @BuiltValueField(wireName: r'expiresAt')
  DateTime? get expiresAt;

  @BuiltValueField(wireName: r'createdAt')
  DateTime get createdAt;

  UserNotification._();

  factory UserNotification([void updates(UserNotificationBuilder b)]) = _$UserNotification;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(UserNotificationBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<UserNotification> get serializer => _$UserNotificationSerializer();
}

class _$UserNotificationSerializer implements PrimitiveSerializer<UserNotification> {
  @override
  final Iterable<Type> types = const [UserNotification, _$UserNotification];

  @override
  final String wireName = r'UserNotification';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    UserNotification object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'category';
    yield serializers.serialize(
      object.category,
      specifiedType: const FullType(UserNotificationCategoryEnum),
    );
    yield r'tone';
    yield serializers.serialize(
      object.tone,
      specifiedType: const FullType(UserNotificationToneEnum),
    );
    yield r'title';
    yield serializers.serialize(
      object.title,
      specifiedType: const FullType(String),
    );
    yield r'message';
    yield serializers.serialize(
      object.message,
      specifiedType: const FullType(String),
    );
    if (object.href != null) {
      yield r'href';
      yield serializers.serialize(
        object.href,
        specifiedType: const FullType(String),
      );
    }
    if (object.branchId != null) {
      yield r'branchId';
      yield serializers.serialize(
        object.branchId,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.metadataMasked != null) {
      yield r'metadataMasked';
      yield serializers.serialize(
        object.metadataMasked,
        specifiedType: const FullType(JsonObject),
      );
    }
    yield r'readAt';
    yield object.readAt == null ? null : serializers.serialize(
      object.readAt,
      specifiedType: const FullType.nullable(DateTime),
    );
    yield r'expiresAt';
    yield object.expiresAt == null ? null : serializers.serialize(
      object.expiresAt,
      specifiedType: const FullType.nullable(DateTime),
    );
    yield r'createdAt';
    yield serializers.serialize(
      object.createdAt,
      specifiedType: const FullType(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    UserNotification object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required UserNotificationBuilder result,
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
        case r'category':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(UserNotificationCategoryEnum),
          ) as UserNotificationCategoryEnum;
          result.category = valueDes;
          break;
        case r'tone':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(UserNotificationToneEnum),
          ) as UserNotificationToneEnum;
          result.tone = valueDes;
          break;
        case r'title':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.title = valueDes;
          break;
        case r'message':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.message = valueDes;
          break;
        case r'href':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.href = valueDes;
          break;
        case r'branchId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.branchId = valueDes;
          break;
        case r'metadataMasked':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(JsonObject),
          ) as JsonObject;
          result.metadataMasked = valueDes;
          break;
        case r'readAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.readAt = valueDes;
          break;
        case r'expiresAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.expiresAt = valueDes;
          break;
        case r'createdAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.createdAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  UserNotification deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = UserNotificationBuilder();
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

class UserNotificationCategoryEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'VERIFICATION')
  static const UserNotificationCategoryEnum VERIFICATION = _$userNotificationCategoryEnum_VERIFICATION;
  @BuiltValueEnumConst(wireName: r'PAYMENT')
  static const UserNotificationCategoryEnum PAYMENT = _$userNotificationCategoryEnum_PAYMENT;
  @BuiltValueEnumConst(wireName: r'PACKAGE')
  static const UserNotificationCategoryEnum PACKAGE = _$userNotificationCategoryEnum_PACKAGE;
  @BuiltValueEnumConst(wireName: r'BOOKING')
  static const UserNotificationCategoryEnum BOOKING = _$userNotificationCategoryEnum_BOOKING;
  @BuiltValueEnumConst(wireName: r'RESCHEDULE')
  static const UserNotificationCategoryEnum RESCHEDULE = _$userNotificationCategoryEnum_RESCHEDULE;
  @BuiltValueEnumConst(wireName: r'CLASS')
  static const UserNotificationCategoryEnum CLASS = _$userNotificationCategoryEnum_CLASS;
  @BuiltValueEnumConst(wireName: r'ATTENDANCE')
  static const UserNotificationCategoryEnum ATTENDANCE = _$userNotificationCategoryEnum_ATTENDANCE;
  @BuiltValueEnumConst(wireName: r'ADJUSTMENT')
  static const UserNotificationCategoryEnum ADJUSTMENT = _$userNotificationCategoryEnum_ADJUSTMENT;
  @BuiltValueEnumConst(wireName: r'OPERATIONS')
  static const UserNotificationCategoryEnum OPERATIONS = _$userNotificationCategoryEnum_OPERATIONS;
  @BuiltValueEnumConst(wireName: r'APPROVAL')
  static const UserNotificationCategoryEnum APPROVAL = _$userNotificationCategoryEnum_APPROVAL;
  @BuiltValueEnumConst(wireName: r'SYSTEM')
  static const UserNotificationCategoryEnum SYSTEM = _$userNotificationCategoryEnum_SYSTEM;

  static Serializer<UserNotificationCategoryEnum> get serializer => _$userNotificationCategoryEnumSerializer;

  const UserNotificationCategoryEnum._(String name): super(name);

  static BuiltSet<UserNotificationCategoryEnum> get values => _$userNotificationCategoryEnumValues;
  static UserNotificationCategoryEnum valueOf(String name) => _$userNotificationCategoryEnumValueOf(name);
}

class UserNotificationToneEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'success')
  static const UserNotificationToneEnum success = _$userNotificationToneEnum_success;
  @BuiltValueEnumConst(wireName: r'info')
  static const UserNotificationToneEnum info = _$userNotificationToneEnum_info;
  @BuiltValueEnumConst(wireName: r'warning')
  static const UserNotificationToneEnum warning = _$userNotificationToneEnum_warning;
  @BuiltValueEnumConst(wireName: r'danger')
  static const UserNotificationToneEnum danger = _$userNotificationToneEnum_danger;

  static Serializer<UserNotificationToneEnum> get serializer => _$userNotificationToneEnumSerializer;

  const UserNotificationToneEnum._(String name): super(name);

  static BuiltSet<UserNotificationToneEnum> get values => _$userNotificationToneEnumValues;
  static UserNotificationToneEnum valueOf(String name) => _$userNotificationToneEnumValueOf(name);
}

