//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/preferred_studio.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'my_profile.g.dart';

/// MyProfile
///
/// Properties:
/// * [id] 
/// * [displayName] 
/// * [emailMasked] 
/// * [phoneMasked] 
/// * [preferredBranch] 
/// * [version] 
@BuiltValue()
abstract class MyProfile implements Built<MyProfile, MyProfileBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'displayName')
  String get displayName;

  @BuiltValueField(wireName: r'emailMasked')
  String? get emailMasked;

  @BuiltValueField(wireName: r'phoneMasked')
  String? get phoneMasked;

  @BuiltValueField(wireName: r'preferredBranch')
  PreferredStudio? get preferredBranch;

  @BuiltValueField(wireName: r'version')
  int get version;

  MyProfile._();

  factory MyProfile([void updates(MyProfileBuilder b)]) = _$MyProfile;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(MyProfileBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<MyProfile> get serializer => _$MyProfileSerializer();
}

class _$MyProfileSerializer implements PrimitiveSerializer<MyProfile> {
  @override
  final Iterable<Type> types = const [MyProfile, _$MyProfile];

  @override
  final String wireName = r'MyProfile';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    MyProfile object, {
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
    yield r'emailMasked';
    yield object.emailMasked == null ? null : serializers.serialize(
      object.emailMasked,
      specifiedType: const FullType.nullable(String),
    );
    yield r'phoneMasked';
    yield object.phoneMasked == null ? null : serializers.serialize(
      object.phoneMasked,
      specifiedType: const FullType.nullable(String),
    );
    yield r'preferredBranch';
    yield object.preferredBranch == null ? null : serializers.serialize(
      object.preferredBranch,
      specifiedType: const FullType.nullable(PreferredStudio),
    );
    yield r'version';
    yield serializers.serialize(
      object.version,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    MyProfile object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required MyProfileBuilder result,
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
        case r'emailMasked':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.emailMasked = valueDes;
          break;
        case r'phoneMasked':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.phoneMasked = valueDes;
          break;
        case r'preferredBranch':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(PreferredStudio),
          ) as PreferredStudio?;
          if (valueDes == null) continue;
          result.preferredBranch.replace(valueDes);
          break;
        case r'version':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.version = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  MyProfile deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = MyProfileBuilder();
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

