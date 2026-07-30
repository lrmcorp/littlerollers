//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/branch_public_profile_summary.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'branch.g.dart';

/// Branch
///
/// Properties:
/// * [id] 
/// * [code] 
/// * [name] 
/// * [timezone] 
/// * [supportWhatsappE164] 
/// * [active] 
/// * [version] 
/// * [publicProfile] 
@BuiltValue(instantiable: false)
abstract class Branch  {
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

  @BuiltValueField(wireName: r'active')
  bool get active;

  @BuiltValueField(wireName: r'version')
  int get version;

  @BuiltValueField(wireName: r'publicProfile')
  BranchPublicProfileSummary? get publicProfile;

  @BuiltValueSerializer(custom: true)
  static Serializer<Branch> get serializer => _$BranchSerializer();
}

class _$BranchSerializer implements PrimitiveSerializer<Branch> {
  @override
  final Iterable<Type> types = const [Branch];

  @override
  final String wireName = r'Branch';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    Branch object, {
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
    yield r'active';
    yield serializers.serialize(
      object.active,
      specifiedType: const FullType(bool),
    );
    yield r'version';
    yield serializers.serialize(
      object.version,
      specifiedType: const FullType(int),
    );
    if (object.publicProfile != null) {
      yield r'publicProfile';
      yield serializers.serialize(
        object.publicProfile,
        specifiedType: const FullType.nullable(BranchPublicProfileSummary),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    Branch object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  @override
  Branch deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return serializers.deserialize(serialized, specifiedType: FullType($Branch)) as $Branch;
  }
}

/// a concrete implementation of [Branch], since [Branch] is not instantiable
@BuiltValue(instantiable: true)
abstract class $Branch implements Branch, Built<$Branch, $BranchBuilder> {
  $Branch._();

  factory $Branch([void Function($BranchBuilder)? updates]) = _$$Branch;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults($BranchBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<$Branch> get serializer => _$$BranchSerializer();
}

class _$$BranchSerializer implements PrimitiveSerializer<$Branch> {
  @override
  final Iterable<Type> types = const [$Branch, _$$Branch];

  @override
  final String wireName = r'$Branch';

  @override
  Object serialize(
    Serializers serializers,
    $Branch object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return serializers.serialize(object, specifiedType: FullType(Branch))!;
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required BranchBuilder result,
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
        case r'active':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.active = valueDes;
          break;
        case r'version':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.version = valueDes;
          break;
        case r'publicProfile':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(BranchPublicProfileSummary),
          ) as BranchPublicProfileSummary?;
          if (valueDes == null) continue;
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
  $Branch deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = $BranchBuilder();
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

