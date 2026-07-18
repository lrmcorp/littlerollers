//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'migration_source_upload_command.g.dart';

/// MigrationSourceUploadCommand
///
/// Properties:
/// * [fileName] 
/// * [mimeType] 
/// * [sizeBytes] 
/// * [sha256] 
/// * [sourceType] 
@BuiltValue()
abstract class MigrationSourceUploadCommand implements Built<MigrationSourceUploadCommand, MigrationSourceUploadCommandBuilder> {
  @BuiltValueField(wireName: r'fileName')
  String get fileName;

  @BuiltValueField(wireName: r'mimeType')
  String get mimeType;

  @BuiltValueField(wireName: r'sizeBytes')
  int get sizeBytes;

  @BuiltValueField(wireName: r'sha256')
  String get sha256;

  @BuiltValueField(wireName: r'sourceType')
  MigrationSourceUploadCommandSourceTypeEnum get sourceType;
  // enum sourceTypeEnum {  CUSTOMER,  PACKAGE,  BALANCE,  INSTRUCTOR,  RATE,  BOOKING,  FINANCIAL_CONTROL,  };

  MigrationSourceUploadCommand._();

  factory MigrationSourceUploadCommand([void updates(MigrationSourceUploadCommandBuilder b)]) = _$MigrationSourceUploadCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(MigrationSourceUploadCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<MigrationSourceUploadCommand> get serializer => _$MigrationSourceUploadCommandSerializer();
}

class _$MigrationSourceUploadCommandSerializer implements PrimitiveSerializer<MigrationSourceUploadCommand> {
  @override
  final Iterable<Type> types = const [MigrationSourceUploadCommand, _$MigrationSourceUploadCommand];

  @override
  final String wireName = r'MigrationSourceUploadCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    MigrationSourceUploadCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'fileName';
    yield serializers.serialize(
      object.fileName,
      specifiedType: const FullType(String),
    );
    yield r'mimeType';
    yield serializers.serialize(
      object.mimeType,
      specifiedType: const FullType(String),
    );
    yield r'sizeBytes';
    yield serializers.serialize(
      object.sizeBytes,
      specifiedType: const FullType(int),
    );
    yield r'sha256';
    yield serializers.serialize(
      object.sha256,
      specifiedType: const FullType(String),
    );
    yield r'sourceType';
    yield serializers.serialize(
      object.sourceType,
      specifiedType: const FullType(MigrationSourceUploadCommandSourceTypeEnum),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    MigrationSourceUploadCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required MigrationSourceUploadCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'fileName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.fileName = valueDes;
          break;
        case r'mimeType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.mimeType = valueDes;
          break;
        case r'sizeBytes':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.sizeBytes = valueDes;
          break;
        case r'sha256':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.sha256 = valueDes;
          break;
        case r'sourceType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(MigrationSourceUploadCommandSourceTypeEnum),
          ) as MigrationSourceUploadCommandSourceTypeEnum;
          result.sourceType = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  MigrationSourceUploadCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = MigrationSourceUploadCommandBuilder();
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

class MigrationSourceUploadCommandSourceTypeEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'CUSTOMER')
  static const MigrationSourceUploadCommandSourceTypeEnum CUSTOMER = _$migrationSourceUploadCommandSourceTypeEnum_CUSTOMER;
  @BuiltValueEnumConst(wireName: r'PACKAGE')
  static const MigrationSourceUploadCommandSourceTypeEnum PACKAGE = _$migrationSourceUploadCommandSourceTypeEnum_PACKAGE;
  @BuiltValueEnumConst(wireName: r'BALANCE')
  static const MigrationSourceUploadCommandSourceTypeEnum BALANCE = _$migrationSourceUploadCommandSourceTypeEnum_BALANCE;
  @BuiltValueEnumConst(wireName: r'INSTRUCTOR')
  static const MigrationSourceUploadCommandSourceTypeEnum INSTRUCTOR = _$migrationSourceUploadCommandSourceTypeEnum_INSTRUCTOR;
  @BuiltValueEnumConst(wireName: r'RATE')
  static const MigrationSourceUploadCommandSourceTypeEnum RATE = _$migrationSourceUploadCommandSourceTypeEnum_RATE;
  @BuiltValueEnumConst(wireName: r'BOOKING')
  static const MigrationSourceUploadCommandSourceTypeEnum BOOKING = _$migrationSourceUploadCommandSourceTypeEnum_BOOKING;
  @BuiltValueEnumConst(wireName: r'FINANCIAL_CONTROL')
  static const MigrationSourceUploadCommandSourceTypeEnum FINANCIAL_CONTROL = _$migrationSourceUploadCommandSourceTypeEnum_FINANCIAL_CONTROL;

  static Serializer<MigrationSourceUploadCommandSourceTypeEnum> get serializer => _$migrationSourceUploadCommandSourceTypeEnumSerializer;

  const MigrationSourceUploadCommandSourceTypeEnum._(String name): super(name);

  static BuiltSet<MigrationSourceUploadCommandSourceTypeEnum> get values => _$migrationSourceUploadCommandSourceTypeEnumValues;
  static MigrationSourceUploadCommandSourceTypeEnum valueOf(String name) => _$migrationSourceUploadCommandSourceTypeEnumValueOf(name);
}

