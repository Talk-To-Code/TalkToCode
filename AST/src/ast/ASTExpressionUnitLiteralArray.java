package ast;
import java.util.*;

import ast.ASTParser.programType;

/**
 * @author GAO RISHENG A0101891L
 * This class is mainly for construction of AST nodes representing a constant array in C/Java/Python
 * Program and its respective syntax generation
 *
 */
public class ASTExpressionUnitLiteralArray extends ASTExpressionUnitLiteral{
	private static final String NODE_TYPE = "Array";
	private ArrayList<ASTExpression> entries;
	private int pType;
	
	public ASTExpressionUnitLiteralArray(programType pTyp){
		super();
		initialize(pTyp);
	}

	public void addValue(String value){
		ASTExpressionUnitLiteral temp = new ASTExpressionUnitLiteral(value);
		this.entries.add(temp);
		temp.parent = this;
	}
	public void addValue(ASTExpression exp){
		this.entries.add(exp);
		exp.parent = this;
	}
	private void initialize(programType pTyp) {
		this.entries = new ArrayList<ASTExpression>();
		switch(pTyp) {
			case C:
				this.pType = INDEX_C;
				break;
			case P:
				this.pType = INDEX_PYTHON;
				break;
			default:
				this.pType = 0;
				break;
		}
	}
	public String typeof(){
		return super.typeof()+"->"+NODE_TYPE;
	}
	
	public String toSyntax() {
		return toSyntax(this.pType);
	}
	
	public String toSyntax(int programmingLanguageSyntax) {
		switch(programmingLanguageSyntax){
		case INDEX_C:
		case INDEX_JAVA:
		{
			this.result = "";
			this.result += "{";
			int index = 0;
			for(;index<this.entries.size()-1;index++){
				this.result+= this.entries.get(index).toSyntax();
				this.result+= ", ";
			}
			this.result+= this.entries.get(index).toSyntax();
			this.result += "}";
			if(this.isQuoted) quote();
			return this.result;
		}
		case INDEX_PYTHON:
		{
			this.result = "";
			this.result += "[";
			int index = 0;
			for(;index<this.entries.size()-1;index++){
				this.result+= this.entries.get(index).toSyntax();
				this.result+= ", ";
			}
			if(this.entries.size() > 0) this.result+= this.entries.get(index).toSyntax();
			this.result += "]";
			if(this.isQuoted) quote();
			return this.result;
		}
		default:
			return "";
		}
		
	}
}
