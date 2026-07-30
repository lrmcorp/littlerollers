//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/date.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'package_update_command.g.dart';

/// PackageUpdateCommand
///
/// Properties:
/// * [name] 
/// * [sessionCount] 
/// * [durationDays] 
/// * [priceRp] 
/// * [effectiveFrom] 
/// * [effectiveUntil] 
/// * [expectedVersion] 
/// * [reason] 
@BuiltValue()
abstract class PackageUpdateCommand implements Built<PackageUpdateCommand, PackageUpdateCommandBuilder> {
  @BuiltValueField(wireName: r'name')
  String? get name;

  @BuiltValueField(wireName: r'sessionCount')
  int? get sessionCount;

  @BuiltValueField(wireName: r'durationDays')
  int? get durationDays;

  @BuiltValueField(wireName: r'priceRp')
  int? get priceRp;

  @BuiltValueField(wireName: r'effectiveFrom')
  Date? get effectiveFrom;

  @BuiltValueField(wireName: r'effectiveUntil')
  Date? get effectiveUntil;

  @BuiltValueField(wireName: r'expectedVersion')
  int get expectedVersion;

  @BuiltValueField(wireName: r'reason')
  String get reason;

  PackageUpdateCommand._();

  factory PackageUpdateCommand([void updates(PackageUpdateCommandBuilder b)]) = _$PackageUpdateCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PackageUpdateCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PackageUpdateCommand> get serializer => _$PackageUpdateCommandSerializer();
}

class _$PackageUpdateCommandSerializer implements PrimitiveSerializer<PackageUpdateCommand> {
  @override
  final Iterable<Type> types = const [PackageUpdateCommand, _$PackageUpdateCommand];

  @override
  final String wireName = r'PackageUpdateCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PackageUpdateCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.name != null) {
      yield r'name';
      yield serializers.serialize(
        object.name,
        specifiedType: const FullType(String),
      );
    }
    if (object.sessionCount != null) {
      yield r'sessionCount';
      yield serializers.serialize(
        object.sessionCount,
        specifiedType: const FullType(int),
      );
    }
    if (object.durationDays != null) {
      yield r'durationDays';
      yield serializers.serialize(
        object.durationDays,
        specifiedType: const FullType(int),
      );
    }
    if (object.priceRp != null) {
      yield r'priceRp';
      yield serializers.serialize(
        object.priceRp,
        specifiedType: const FullType(int),
      );
    }
    if (object.effectiveFrom != null) {
      yield r'effectiveFrom';
      yield serializers.serialize(
        object.effectiveFrom,
        specifiedType: const FullType(Date),
      );
    }
    if (object.effectiveUntil != null) {
      yield r'effectiveUntil';
      yield serializers.serialize(
        object.effectiveUntil,
        specifiedType: const FullType.nullable(Date),
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
    PackageUpdateCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PackageUpdateCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
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
  PackageUpdateCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PackageUpdateCommandBuilder();
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

