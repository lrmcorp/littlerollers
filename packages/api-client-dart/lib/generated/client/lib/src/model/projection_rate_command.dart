//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:openapi/src/model/dec006_approval.dart';
import 'package:openapi/src/model/effective_period.dart';
import 'package:openapi/src/model/date.dart';
import 'package:built_value/json_object.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'projection_rate_command.g.dart';

/// ProjectionRateCommand
///
/// Properties:
/// * [effectiveFrom] 
/// * [effectiveUntil] 
/// * [kind] 
/// * [branchId] 
/// * [classTypeId] 
/// * [rateRp] 
/// * [reason] 
/// * [configurationId] 
/// * [approvedEvidence] 
/// * [configurationPackChecksum] 
/// * [approval] 
@BuiltValue()
abstract class ProjectionRateCommand implements EffectivePeriod, Built<ProjectionRateCommand, ProjectionRateCommandBuilder> {
  @BuiltValueField(wireName: r'branchId')
  String get branchId;

  @BuiltValueField(wireName: r'reason')
  String get reason;

  @BuiltValueField(wireName: r'configurationPackChecksum')
  String? get configurationPackChecksum;

  @BuiltValueField(wireName: r'kind')
  JsonObject? get kind;

  @BuiltValueField(wireName: r'approvedEvidence')
  String? get approvedEvidence;

  @BuiltValueField(wireName: r'approval')
  Dec006Approval? get approval;

  @BuiltValueField(wireName: r'rateRp')
  int get rateRp;

  @BuiltValueField(wireName: r'configurationId')
  String? get configurationId;

  @BuiltValueField(wireName: r'classTypeId')
  String get classTypeId;

  ProjectionRateCommand._();

  factory ProjectionRateCommand([void updates(ProjectionRateCommandBuilder b)]) = _$ProjectionRateCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ProjectionRateCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ProjectionRateCommand> get serializer => _$ProjectionRateCommandSerializer();
}

class _$ProjectionRateCommandSerializer implements PrimitiveSerializer<ProjectionRateCommand> {
  @override
  final Iterable<Type> types = const [ProjectionRateCommand, _$ProjectionRateCommand];

  @override
  final String wireName = r'ProjectionRateCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ProjectionRateCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'branchId';
    yield serializers.serialize(
      object.branchId,
      specifiedType: const FullType(String),
    );
    yield r'reason';
    yield serializers.serialize(
      object.reason,
      specifiedType: const FullType(String),
    );
    if (object.effectiveUntil != null) {
      yield r'effectiveUntil';
      yield serializers.serialize(
        object.effectiveUntil,
        specifiedType: const FullType.nullable(Date),
      );
    }
    if (object.configurationPackChecksum != null) {
      yield r'configurationPackChecksum';
      yield serializers.serialize(
        object.configurationPackChecksum,
        specifiedType: const FullType(String),
      );
    }
    yield r'kind';
    yield object.kind == null ? null : serializers.serialize(
      object.kind,
      specifiedType: const FullType.nullable(JsonObject),
    );
    if (object.approvedEvidence != null) {
      yield r'approvedEvidence';
      yield serializers.serialize(
        object.approvedEvidence,
        specifiedType: const FullType(String),
      );
    }
    if (object.approval != null) {
      yield r'approval';
      yield serializers.serialize(
        object.approval,
        specifiedType: const FullType(Dec006Approval),
      );
    }
    yield r'rateRp';
    yield serializers.serialize(
      object.rateRp,
      specifiedType: const FullType(int),
    );
    if (object.configurationId != null) {
      yield r'configurationId';
      yield serializers.serialize(
        object.configurationId,
        specifiedType: const FullType(String),
      );
    }
    yield r'effectiveFrom';
    yield serializers.serialize(
      object.effectiveFrom,
      specifiedType: const FullType(Date),
    );
    yield r'classTypeId';
    yield serializers.serialize(
      object.classTypeId,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    ProjectionRateCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ProjectionRateCommandBuilder result,
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
        case r'reason':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.reason = valueDes;
          break;
        case r'effectiveUntil':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(Date),
          ) as Date?;
          if (valueDes == null) continue;
          result.effectiveUntil = valueDes;
          break;
        case r'configurationPackChecksum':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.configurationPackChecksum = valueDes;
          break;
        case r'kind':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(JsonObject),
          ) as JsonObject?;
          if (valueDes == null) continue;
          result.kind = valueDes;
          break;
        case r'approvedEvidence':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.approvedEvidence = valueDes;
          break;
        case r'approval':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Dec006Approval),
          ) as Dec006Approval;
          result.approval.replace(valueDes);
          break;
        case r'rateRp':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.rateRp = valueDes;
          break;
        case r'configurationId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.configurationId = valueDes;
          break;
        case r'effectiveFrom':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Date),
          ) as Date;
          result.effectiveFrom = valueDes;
          break;
        case r'classTypeId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.classTypeId = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  ProjectionRateCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ProjectionRateCommandBuilder();
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

