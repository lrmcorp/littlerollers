//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'migration_batch_command.g.dart';

/// MigrationBatchCommand
///
/// Properties:
/// * [sourceUploadIds] 
/// * [mappingVersion] 
/// * [sourceChecksum] 
/// * [mode] 
/// * [reason] 
@BuiltValue()
abstract class MigrationBatchCommand implements Built<MigrationBatchCommand, MigrationBatchCommandBuilder> {
  @BuiltValueField(wireName: r'sourceUploadIds')
  BuiltList<String> get sourceUploadIds;

  @BuiltValueField(wireName: r'mappingVersion')
  String get mappingVersion;

  @BuiltValueField(wireName: r'sourceChecksum')
  String get sourceChecksum;

  @BuiltValueField(wireName: r'mode')
  MigrationBatchCommandModeEnum get mode;
  // enum modeEnum {  DRY_RUN,  APPLY,  };

  @BuiltValueField(wireName: r'reason')
  String? get reason;

  MigrationBatchCommand._();

  factory MigrationBatchCommand([void updates(MigrationBatchCommandBuilder b)]) = _$MigrationBatchCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(MigrationBatchCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<MigrationBatchCommand> get serializer => _$MigrationBatchCommandSerializer();
}

class _$MigrationBatchCommandSerializer implements PrimitiveSerializer<MigrationBatchCommand> {
  @override
  final Iterable<Type> types = const [MigrationBatchCommand, _$MigrationBatchCommand];

  @override
  final String wireName = r'MigrationBatchCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    MigrationBatchCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'sourceUploadIds';
    yield serializers.serialize(
      object.sourceUploadIds,
      specifiedType: const FullType(BuiltList, [FullType(String)]),
    );
    yield r'mappingVersion';
    yield serializers.serialize(
      object.mappingVersion,
      specifiedType: const FullType(String),
    );
    yield r'sourceChecksum';
    yield serializers.serialize(
      object.sourceChecksum,
      specifiedType: const FullType(String),
    );
    yield r'mode';
    yield serializers.serialize(
      object.mode,
      specifiedType: const FullType(MigrationBatchCommandModeEnum),
    );
    if (object.reason != null) {
      yield r'reason';
      yield serializers.serialize(
        object.reason,
        specifiedType: const FullType(String),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    MigrationBatchCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required MigrationBatchCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'sourceUploadIds':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.sourceUploadIds.replace(valueDes);
          break;
        case r'mappingVersion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.mappingVersion = valueDes;
          break;
        case r'sourceChecksum':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.sourceChecksum = valueDes;
          break;
        case r'mode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(MigrationBatchCommandModeEnum),
          ) as MigrationBatchCommandModeEnum;
          result.mode = valueDes;
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
  MigrationBatchCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = MigrationBatchCommandBuilder();
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

class MigrationBatchCommandModeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'DRY_RUN')
  static const MigrationBatchCommandModeEnum DRY_RUN = _$migrationBatchCommandModeEnum_DRY_RUN;
  @BuiltValueEnumConst(wireName: r'APPLY')
  static const MigrationBatchCommandModeEnum APPLY = _$migrationBatchCommandModeEnum_APPLY;

  static Serializer<MigrationBatchCommandModeEnum> get serializer => _$migrationBatchCommandModeEnumSerializer;

  const MigrationBatchCommandModeEnum._(String name): super(name);

  static BuiltSet<MigrationBatchCommandModeEnum> get values => _$migrationBatchCommandModeEnumValues;
  static MigrationBatchCommandModeEnum valueOf(String name) => _$migrationBatchCommandModeEnumValueOf(name);
}

