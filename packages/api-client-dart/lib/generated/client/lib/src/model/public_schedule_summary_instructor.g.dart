// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'public_schedule_summary_instructor.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PublicScheduleSummaryInstructor
    extends PublicScheduleSummaryInstructor {
  @override
  final String displayName;

  factory _$PublicScheduleSummaryInstructor([
    void Function(PublicScheduleSummaryInstructorBuilder)? updates,
  ]) => (PublicScheduleSummaryInstructorBuilder()..update(updates))._build();

  _$PublicScheduleSummaryInstructor._({required this.displayName}) : super._();
  @override
  PublicScheduleSummaryInstructor rebuild(
    void Function(PublicScheduleSummaryInstructorBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PublicScheduleSummaryInstructorBuilder toBuilder() =>
      PublicScheduleSummaryInstructorBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PublicScheduleSummaryInstructor &&
        displayName == other.displayName;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, displayName.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(
      r'PublicScheduleSummaryInstructor',
    )..add('displayName', displayName)).toString();
  }
}

class PublicScheduleSummaryInstructorBuilder
    implements
        Builder<
          PublicScheduleSummaryInstructor,
          PublicScheduleSummaryInstructorBuilder
        > {
  _$PublicScheduleSummaryInstructor? _$v;

  String? _displayName;
  String? get displayName => _$this._displayName;
  set displayName(String? displayName) => _$this._displayName = displayName;

  PublicScheduleSummaryInstructorBuilder() {
    PublicScheduleSummaryInstructor._defaults(this);
  }

  PublicScheduleSummaryInstructorBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _displayName = $v.displayName;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PublicScheduleSummaryInstructor other) {
    _$v = other as _$PublicScheduleSummaryInstructor;
  }

  @override
  void update(void Function(PublicScheduleSummaryInstructorBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PublicScheduleSummaryInstructor build() => _build();

  _$PublicScheduleSummaryInstructor _build() {
    final _$result =
        _$v ??
        _$PublicScheduleSummaryInstructor._(
          displayName: BuiltValueNullFieldError.checkNotNull(
            displayName,
            r'PublicScheduleSummaryInstructor',
            'displayName',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
