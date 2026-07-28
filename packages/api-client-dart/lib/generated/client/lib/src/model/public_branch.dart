//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/public_branch_profile.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'public_branch.g.dart';

/// PublicBranch
///
/// Properties:
/// * [id] 
/// * [code] 
/// * [name] 
/// * [timezone] 
/// * [supportWhatsappE164] 
/// * [publicProfile] 
@BuiltValue(instantiable: false)
abstract class PublicBranch  {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'code')
  String get code;

  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'timezone')
  String get timezone;

  @BuiltValueField(wireName: r'supportWhatsappE164')
  String? get supportWhatsappE164;

  @BuiltValueField(wireName: r'publicProfile')
  PublicBranchProfile get publicProfile;

  @BuiltValueSerializer(custom: true)
  static Serializer<PublicBranch> get serializer => _$PublicBranchSerializer();
}

class _$PublicBranchSerializer implements PrimitiveSerializer<PublicBranch> {
  @override
  final Iterable<Type> types = const [PublicBranch];

  @override
  final String wireName = r'PublicBranch';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PublicBranch object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'code';
    yield serializers.serialize(
      object.code,
      specifiedType: const FullType(String),
    );
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
    );
    yield r'timezone';
    yield serializers.serialize(
      object.timezone,
      specifiedType: const FullType(String),
    );
    if (object.supportWhatsappE164 != null) {
      yield r'supportWhatsappE164';
      yield serializers.serialize(
        object.supportWhatsappE164,
        specifiedType: const FullType.nullable(String),
      );
    }
    yield r'publicProfile';
    yield serializers.serialize(
      object.publicProfile,
      specifiedType: const FullType(PublicBranchProfile),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PublicBranch object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  @override
  PublicBranch deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return serializers.deserialize(serialized, specifiedType: FullType($PublicBranch)) as $PublicBranch;
  }
}

/// a concrete implementation of [PublicBranch], since [PublicBranch] is not instantiable
@BuiltValue(instantiable: true)
abstract class $PublicBranch implements PublicBranch, Built<$PublicBranch, $PublicBranchBuilder> {
  $PublicBranch._();

  factory $PublicBranch([void Function($PublicBranchBuilder)? updates]) = _$$PublicBranch;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults($PublicBranchBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<$PublicBranch> get serializer => _$$PublicBranchSerializer();
}

class _$$PublicBranchSerializer implements PrimitiveSerializer<$PublicBranch> {
  @override
  final Iterable<Type> types = const [$PublicBranch, _$$PublicBranch];

  @override
  final String wireName = r'$PublicBranch';

  @override
  Object serialize(
    Serializers serializers,
    $PublicBranch object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return serializers.serialize(object, specifiedType: FullType(PublicBranch))!;
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PublicBranchBuilder result,
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
        case r'code':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.code = valueDes;
          break;
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.name = valueDes;
          break;
        case r'timezone':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.timezone = valueDes;
          break;
        case r'supportWhatsappE164':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.supportWhatsappE164 = valueDes;
          break;
        case r'publicProfile':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PublicBranchProfile),
          ) as PublicBranchProfile;
          result.publicProfile.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  $PublicBranch deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = $PublicBranchBuilder();
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

