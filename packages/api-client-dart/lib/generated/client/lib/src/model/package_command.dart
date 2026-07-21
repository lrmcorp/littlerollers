//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/date.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'package_command.g.dart';

/// Synthetic fixtures must supply every commercial value explicitly; no production defaults are implied.
///
/// Properties:
/// * [branchId] 
/// * [classTypeId] 
/// * [businessKey] 
/// * [name] 
/// * [sessionCount] 
/// * [durationDays] 
/// * [priceRp] 
/// * [effectiveFrom] 
/// * [effectiveUntil] 
@BuiltValue()
abstract class PackageCommand implements Built<PackageCommand, PackageCommandBuilder> {
  @BuiltValueField(wireName: r'branchId')
  String get branchId;

  @BuiltValueField(wireName: r'classTypeId')
  String get classTypeId;

  @BuiltValueField(wireName: r'businessKey')
  String get businessKey;

  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'sessionCount')
  int get sessionCount;

  @BuiltValueField(wireName: r'durationDays')
  int get durationDays;

  @BuiltValueField(wireName: r'priceRp')
  int get priceRp;

  @BuiltValueField(wireName: r'effectiveFrom')
  Date get effectiveFrom;

  @BuiltValueField(wireName: r'effectiveUntil')
  Date? get effectiveUntil;

  PackageCommand._();

  factory PackageCommand([void updates(PackageCommandBuilder b)]) = _$PackageCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PackageCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PackageCommand> get serializer => _$PackageCommandSerializer();
}

class _$PackageCommandSerializer implements PrimitiveSerializer<PackageCommand> {
  @override
  final Iterable<Type> types = const [PackageCommand, _$PackageCommand];

  @override
  final String wireName = r'PackageCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PackageCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'branchId';
    yield serializers.serialize(
      object.branchId,
      specifiedType: const FullType(String),
    );
    yield r'classTypeId';
    yield serializers.serialize(
      object.classTypeId,
      specifiedType: const FullType(String),
    );
    yield r'businessKey';
    yield serializers.serialize(
      object.businessKey,
      specifiedType: const FullType(String),
    );
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
    );
    yield r'sessionCount';
    yield serializers.serialize(
      object.sessionCount,
      specifiedType: const FullType(int),
    );
    yield r'durationDays';
    yield serializers.serialize(
      object.durationDays,
      specifiedType: const FullType(int),
    );
    yield r'priceRp';
    yield serializers.serialize(
      object.priceRp,
      specifiedType: const FullType(int),
    );
    yield r'effectiveFrom';
    yield serializers.serialize(
      object.effectiveFrom,
      specifiedType: const FullType(Date),
    );
    if (object.effectiveUntil != null) {
      yield r'effectiveUntil';
      yield serializers.serialize(
        object.effectiveUntil,
        specifiedType: const FullType.nullable(Date),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    PackageCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PackageCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'branchId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.branchId = valueDes;
          break;
        case r'classTypeId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.classTypeId = valueDes;
          break;
        case r'businessKey':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.businessKey = valueDes;
          break;
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.name = valueDes;
          break;
        case r'sessionCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.sessionCount = valueDes;
          break;
        case r'durationDays':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.durationDays = valueDes;
          break;
        case r'priceRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.priceRp = valueDes;
          break;
        case r'effectiveFrom':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Date),
          ) as Date;
          result.effectiveFrom = valueDes;
          break;
        case r'effectiveUntil':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(Date),
          ) as Date?;
          if (valueDes == null) continue;
          result.effectiveUntil = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PackageCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PackageCommandBuilder();
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

